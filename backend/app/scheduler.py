from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

# Initialize the scheduler
scheduler = BackgroundScheduler()

# Function to execute every 10 minutes
def task_every_10_minutes():
    print(f"Task running every 10 minutes at {datetime.now()}")

# Function to execute at midnight
def task_at_midnight():
    print(f"Midnight task executed at {datetime.now()}")

# Add jobs to the scheduler
scheduler.add_job(task_every_10_minutes, 'interval', minutes=10)
scheduler.add_job(task_at_midnight, 'cron', hour=0, minute=0)

# Start the scheduler
def start_scheduler():
    scheduler.start()

# Shutdown the scheduler
def stop_scheduler():
    scheduler.shutdown()
