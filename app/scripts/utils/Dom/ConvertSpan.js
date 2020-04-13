export default class ConvertSpan {

    constructor(element) {
        element.innerHTML = element.textContent.replace(/[^\n- ]/g,"<span>$&</span>");
    }
}