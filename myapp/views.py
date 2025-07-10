# C:\Users\DELL\teacherporta\core\views.py

from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt # Import csrf_exempt
from django.http import JsonResponse
import json # Import json for parsing JSON requests
from django.views.decorators.csrf import csrf_protect


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

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Student  # Adjust the import as needed

@csrf_exempt
def create_or_add_student(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            name = data.get('name', '').strip()
            subject = data.get('subject', '').strip()
            marks = int(data.get('marks', 0))

            if not name or not subject:
                return JsonResponse({'success': False, 'error': 'Name and subject are required.'}, status=400)

            try:
                student = Student.objects.get(name__iexact=name, subject__iexact=subject)
                student.marks += marks
                student.save()
                return JsonResponse({'success': True, 'message': 'Marks added to existing student.'})
            except Student.DoesNotExist:
                Student.objects.create(name=name, subject=subject, marks=marks)
                return JsonResponse({'success': True, 'message': 'New student added.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

    
@csrf_protect
def deleteStudent(request, id):
    if request.method == 'POST':
        try:
            student = Student.objects.get(id=id)
            student.delete()
            return JsonResponse({'status': 'success'})
        except Student.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Student not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)
@csrf_exempt 
def update_student(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            student = Student.objects.get(id=id)

            # Update available fields
            if 'name' in data:
                student.name = data['name'].strip()
            if 'subject' in data:
                student.subject = data['subject'].strip()
            if 'marks' in data:
                try:
                    student.marks = int(data['marks'])
                except ValueError:
                    return JsonResponse({'status': 'error', 'message': 'Marks must be an integer'}, status=400)

            student.save()
            return JsonResponse({'status': 'success', 'message': 'Student updated successfully'})

        except Student.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Student not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)

def logout_view(request):
    """
    Logs out the teacher by clearing the session.
    """
    request.session.flush()
    return redirect('login')
