from huey.contrib.djhuey import db_task

# Define any tasks for Huey to queue in this file.
# They can be simple wrappers to other functions/methods elsewhere -- complex belongs in services.
# But this is how they're registered with the task consumer.


@db_task()
def queue_extraction(extractor):
    return extractor.get_words()
