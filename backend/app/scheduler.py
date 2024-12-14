import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import SessionLocal
from app.models import CS_UserEvents

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize the scheduler
scheduler = BackgroundScheduler()

def reset_streak_counts(db: Session):
    """
    Resets streak counts for events not modified in the last 1 day or with NULL modified timestamps.
    """
    try:
        now = datetime.utcnow()
        cutoff = now - timedelta(days=1)

        logger.info(f"Starting streak reset task at {now}")

        # Reset streaks where `modified` is NULL or older than the cutoff
        affected_rows = (
            db.query(CS_UserEvents)
            .filter(or_(CS_UserEvents.modified == None, CS_UserEvents.modified < cutoff))
            .update({"streak_count": 0}, synchronize_session=False)
        )

        db.commit()
        logger.info(f"Streak counts reset for {affected_rows} rows.")
    except Exception as e:
        logger.error(f"Error resetting streak counts: {e}", exc_info=True)

def task_at_midnight():
    """
    Task that runs at midnight to reset streak counts.
    """
    logger.info("Executing midnight task to reset streak counts.")
    with SessionLocal() as db:  # Using SessionLocal directly
        reset_streak_counts(db)

def task_every_10_minutes():
    print(f"Task running every 10 minutes at {datetime.now()}")

# Add jobs to the scheduler
# scheduler.add_job(task_every_10_minutes, 'interval', minutes=10)
scheduler.add_job(task_at_midnight, 'cron', hour=0, minute=0)

def start_scheduler():
    logger.info("Starting scheduler.")
    scheduler.start()

def stop_scheduler():
    logger.info("Stopping scheduler.")
    scheduler.shutdown()
