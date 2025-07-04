# C:\Users\DELL\teacherporta\core\views.py

from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt # Import csrf_exempt
from django.http import JsonResponse
import json # Import json for parsing JSON requests

from .models import Teacher, Student
from django.contrib import messages

def login_view(request):
    """
    Handles teacher login. Authenticates credentials against the database.
    """
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        try:
            teacher = Teacher.objects.get(username=username, password=password)
            request.session['teacher'] = teacher.username
            return redirect('home')
        except Teacher.DoesNotExist:
            messages.error(request, "Invalid Credentials")
    return render(request, 'login.html')

def home(request):
    """
    Displays the student listing screen. Requires teacher to be logged in.
    """
    if 'teacher' not in request.session:
        return redirect('login')
    students = Student.objects.all()
    return render(request, 'home.html', {'students': students})

def add_student(request):
    """
    Handles adding a new student. Checks for existing student by name and subject.
    If student exists, it shows an error message and does not add new marks.
    If student does not exist, a new record is created.
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        subject = request.POST.get('subject')
        marks_str = request.POST.get('marks')

        try:
            marks = int(marks_str)
        except (ValueError, TypeError):
            messages.error(request, "Marks must be a valid number.")
            return redirect('home')

        
        existing_student = Student.objects.filter(name=name, subject=subject).first()

        if existing_student:
            
            messages.error(request, f"Student '{name}' with subject '{subject}' already exists.")
        else:
            
            Student.objects.create(name=name, subject=subject, marks=marks)
            messages.success(request, f"Added new student {name} ({subject}).")

    return redirect('home')

def delete_student(request, id):
    """
    Deletes a student record by ID.
    """
    try:
        student = Student.objects.get(id=id)
        student.delete()
        messages.success(request, f"Student '{student.name}' deleted successfully.")
    except Student.DoesNotExist:
        messages.error(request, "Student not found.")
    return redirect('home')

@csrf_exempt 
def update_student(request, id):
    """
    Handles AJAX requests to update a single field (name, subject, or marks) for a student.
    Expects JSON payload: {"field": "fieldName", "value": "newValue"}
    """
    if request.method == 'POST':
        try:
            
            data = json.loads(request.body.decode('utf-8'))
            field = data.get('field')
            value = data.get('value')

            # Validate input data
            if not field or not value:
                return JsonResponse({'status': 'error', 'message': 'Missing field or value'}, status=400)

            # Find the student by ID
            student = Student.objects.get(id=id)

            # Update the specific field based on the 'field' parameter
            if field == 'name':
                student.name = value
            elif field == 'subject':
                student.subject = value
            elif field == 'marks':
                try:
                    student.marks = int(value)
                except ValueError:
                    return JsonResponse({'status': 'error', 'message': 'Marks must be an integer'}, status=400)
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid field specified'}, status=400)
            
            student.save() # Save the changes to the database

            return JsonResponse({'status': 'success', 'message': 'Student updated successfully'})

        except Student.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Student not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format in request body'}, status=400)
        except Exception as e:
            # Catch any other unexpected errors
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    # Return 405 Method Not Allowed for non-POST requests
    return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)

def logout_view(request):
    """
    Logs out the teacher by clearing the session.
    """
    request.session.flush()
    return redirect('login')
