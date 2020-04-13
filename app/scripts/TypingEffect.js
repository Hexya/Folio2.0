import {TimelineLite} from "gsap";
import {ConvertSpan} from "./utils/Dom";

export default class TypingEffect {

    constructor(contText1,speed0,timeDelay0,contText2,contText3,timeDelay1,contText4,timeDelay2) {

        let txt1 = document.querySelector(contText1);
        new ConvertSpan(txt1);

        let tl = new TimelineLite();
        tl.staggerFrom(txt1.querySelectorAll('span'),0.1, {autoAlpha:0},speed0,timeDelay0)
        if(contText2) {
            let txt2 = document.querySelector(contText2);
            new ConvertSpan(txt2);
            tl.staggerFrom(txt2.querySelectorAll('span'),0.1, {autoAlpha:0},0.05)
            if (contText3) {
                let txt3 = document.querySelector(contText3);
                new ConvertSpan(txt3);
                tl.staggerFrom(txt3.querySelectorAll('span'), 0.1, {autoAlpha: 0}, 0.05, timeDelay1)
                if (contText4) {
                    let txt4 = document.querySelector(contText4);
                    new ConvertSpan(txt4);
                    tl.staggerFrom(txt4.querySelectorAll('span'), 0.1, {autoAlpha: 0}, 0.05, timeDelay2)
                }
            }
        }
    }
}