
export async function submitForm(event, submitCallback, failCallback, cleanupCallback, prechecks = []) {
    event.preventDefault();
    const data = new FormData(event.target);

    for (let func of prechecks) {
        if (!func(data)) {
            return
        }
    }

    try {
        await submitCallback(data);
    } catch (e) {
        failCallback(e);
    } finally {
        cleanupCallback();
    }
}