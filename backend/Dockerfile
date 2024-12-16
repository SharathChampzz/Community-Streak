# Use a slim Python base image for production
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /backend

# Copy the requirements.txt file
COPY requirements.txt .

# Install dependencies using pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code
COPY app /backend/app

# Expose port 80 (or the port your FastAPI app uses)
EXPOSE 80

# Command to print the directory structure, current working directory, and run your Uvicorn server
CMD ["sh", "-c", "echo 'Current working directory:' && pwd && echo 'Directory structure:' && ls -R && uvicorn app.main:app --host 0.0.0.0 --port 80"]