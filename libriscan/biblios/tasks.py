import logging

from huey.contrib.djhuey import db_task, periodic_task
from huey.contrib.djhuey import HUEY as huey
from huey import crontab

logger = logging.getLogger("django")
# Define any tasks for Huey to queue in this file.
# They can be simple wrappers to other functions/methods elsewhere -- complex belongs in services.
# But this is how they're registered with the task consumer.


@db_task()
def queue_extraction(extractor):
    # Confirm that the requested page can still extract text
    if extractor.page.can_extract:
        try:
            logger.info(f"Running page {extractor.page.id} extractor")
            return extractor.get_words()
        except Exception as e:
            logger.error(e)
            huey.get(extractor.page.extraction_key)
    else:
        logger.info(f"Couldn't extract page {extractor.page.id}")
        huey.get(extractor.page.extraction_key)


@periodic_task(crontab(minute="*/10"))
def check_timeouts():
    """Periodically clean out any timed-out extraction handles from the Huey store."""
    from datetime import datetime, timedelta
    from pickle import loads

    for task, start_time in huey.all_results().items():
        if task.startswith("extracting-") and datetime.today() - loads(
            start_time
        ) > timedelta(minutes=10):
            huey.get(task)
