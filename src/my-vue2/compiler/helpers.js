export function addHandler(
    el,
    name,
    value
){
    const newHandler = { value:value.trim() }
    el.events = el.events || {}
    el.events[name] = newHandler;
}