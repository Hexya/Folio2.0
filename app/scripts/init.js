import objFile from '../assets/models/modelObj.obj';
import rockFile from '../assets/models/Morceaux_01.obj';
import fontFile from '../assets/fonts/Avenir.json';
import Ode from '../assets/img/project/OdeScreen.jpg';
import RundFromLove from '../assets/img/project/RunFromLoveScreen.jpg';
import SabineExp from '../assets/img/project/SabineScreen.jpg';
import Tinnitus from '../assets/img/project/TinnitusScreen.png';
import DataViz from '../assets/img/project/DataVizScreen.jpg';
import canvasSound from '../assets/img/project/CanvasSoundScreen.jpg';
import {TweenMax, Power2, TimelineLite} from 'gsap/TweenMax';
import { GLTFLoader } from 'three/examples/js/loaders/GLTFLoader';
let OrbitControls = require('three-orbit-controls')(THREE)

import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/shaders/CopyShader'
import 'three/examples/js/shaders/DotScreenShader'
import 'three/examples/js/shaders/LuminosityHighPassShader';
import 'three/examples/js/postprocessing/UnrealBloomPass';
import 'three/examples/js/shaders/FXAAShader.js';

import { TimelineMax, Power4 } from 'gsap';

// UTILS CLASS
import { getPerspectiveSize } from './utils/3d';
import TypingEffect from './TypingEffect';
import ProjectDeformContent from './ProjectDeformContent'

//TEMPLATES TITLE
let firstSceneTemplate = require('./Templates/Scenes/firstSceneTemplate.tpl');
let secSceneTemplate = require('./Templates/Scenes/secSceneTemplate.tpl');
let thirdSceneTemplate = require('./Templates/Scenes/thirdSceneTemplate.tpl');
let fourthSceneTemplate = require('./Templates/Scenes/fourthSceneTemplate.tpl');
let fifthSceneTemplate = require('./Templates/Scenes/fifthSceneTemplate.tpl');
let sixthSceneTemplate = require('./Templates/Scenes/sixthSceneTemplate.tpl');

//TEMPLATES CONTENT
let firstProjectContent = require('./Templates/Projects/firstProjectContent.tpl');
let secProjectContent = require('./Templates/Projects/secProjectContent.tpl');
let thirdProjectContent = require('./Templates/Projects/thirdProjectContent.tpl');
let fourthProjectContent = require('./Templates/Projects/fourthProjectContent.tpl');
let fifthProjectContent = require('./Templates/Projects/fifthProjectContent.tpl');

let composer, renderPass, bloomPass, chromaticAberration, chromaticAberrationPass;
let params = {
    exposure: 0,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: .4
};

export default class App {

    constructor() {

        this.index = 0;
        this.timerStep = 0;
        this.startTimer = 1; //10 Fast 1 Normal
        this.scrolls = [];
        this.duration = .5;
        this.delay = 0;
        this.waterDeform = 0;

        //Load
        this.percentLoad = 0;
        this.loadRoackA = 0;
        this.loadRoackB = 0;
        this.loadWall = 0;

        this.inProject = false;
        this.inProjectUpdate = false;

        //Mobile
        this.beginMove = [];
        this.movement = 0;

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        this.mouse = new THREE.Vector2();

        //THREE SCENE
        this.container = document.querySelector( '#main' );
        document.body.appendChild( this.container );

        this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.01, 10000 );
        this.camera.position.y = 0;
        this.camera.position.z = 55;

        /////////////// ORBIT ///////////////
        /////////////// ORBIT ///////////////
        //this.controls = new OrbitControls(this.camera)
        /////////////// ORBIT ///////////////
        /////////////// ORBIT ///////////////

        this.scene = new THREE.Scene();

        this.wallLoader();
        this.rockLoader();
        this.backRockLoader();
        //Project Deform Page
        this.projectDeformContent;
        this.into =false;

        //TEXT
        let fontLoads = new THREE.FontLoader();
        fontLoads.load( fontFile, ( font ) => {
            this.titleText = new THREE.TextGeometry( 'L  O  I  C    B  E  L  A  I  D   -   R  E  M  E  S  A  L', {font: font, size: 5, height: 1,} );
            this.fontMat = new THREE.MeshBasicMaterial({ color: 0xFFB73A ,transparent:true});
            this.fontMesh = new THREE.Mesh(this.titleText, this.fontMat);
            this.scene.add( this.fontMesh );
            this.fontMesh.position.set(-70,17,-81);
        } );

        //PLANE
        this.planeGroup = new THREE.Group();

        //LIGHT
        this.dirLight = new THREE.DirectionalLight( 0xffffff, 8 );//Power light
        this.dirLight.castShadow = true;
        this.dirLight.position.set(0,-150,-50);
        this.scene.add(this.dirLight);

        this.targetObject = new THREE.Object3D();
        this.scene.add(this.targetObject);
        this.targetObject.position.y = -150;

        this.dirLight.target = this.targetObject;

        this.baseLight = new THREE.DirectionalLight( 0xffffff, 6 );//Power light
        this.baseLight.castShadow = true;
        this.baseLight.position.set(50,-60,-50);
        this.scene.add(this.baseLight);

        //RENDERER
        this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
        this.renderer.setClearColor( 0x22aa01, 0 );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.container.appendChild( this.renderer.domElement );

        this.renderer.setAnimationLoop( this.render.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this,true), false);
        this.addComposer();

        //window.addEventListener( 'mousemove', this.onMouseMove, false );
        document.querySelector('canvas').addEventListener( 'mousemove', this.onMouseMove.bind(this), false );

        this.aboutPage();
        this.addEvents();
    }

    //WALL
    wallLoader() {
        this.groupWall = new THREE.Group();
        let wallLoader = new THREE.OBJLoader();
        wallLoader.load( objFile, ( modelObj )=> {
                modelObj.traverse( function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({color: 0xfafbfc, specular: 0xf00, shininess: 100,});
                        child.castShadow = true; //default is false
                        child.receiveShadow = true; //default is false

                        child.scale.set(1.5,1.5,1.5);
                        switch (child.name) {
                            case "Réseau_d'atomes.001":
                                child.material = new THREE.MeshStandardMaterial( { color: 0x414141, emissive:0x0, roughness: 0.29, metalness: 1} )
                                break;
                            case "Fracture_Voronoï.001":
                                child.material = new THREE.MeshStandardMaterial( { color: 0x414141, emissive:0x0, roughness: 0.29, metalness: 1} )
                                break;
                        }
                    }
                })
                this.box3 = new THREE.Box3().setFromObject(modelObj) //Max and min of object
                this.groupWall.add( modelObj );
                this.scene.add( this.groupWall );

                modelObj.position.y = this.box3.max.y * 0.5;

                //PLANE
                for(let i=0; i<5; i++) {
                    this.planeGeometry('planeNumber'+i, i, modelObj);
                }
                this.planePosition();

                for(let i=0; i<2; i++) {
                    this.beginAnimation('planeAnim', i);
                }
                this.positionAnimation();

                // Remove Loader
                this.loaded();
                this.modelObj = modelObj;

                this.wallObj = modelObj;

                this.onWindowResize()
            },
            (xhr) => { //Main load
                this.loadWall = (xhr.loaded / xhr.total * 100);
                this.percentLoad = (this.loadRockA + this.loadRoackB + this.loadWall)/3;
                if(this.percentLoad) {
                    document.querySelector('.load-progress').innerHTML = Math.floor(this.percentLoad) +'%';
                    //console.log(Math.floor(this.percentLoad) +'%')
                }
            },
            (error) => {
                console.log( 'An error happened' );
            }
        );
    }

    //ROCK
    rockLoader() {
        this.groupWall = new THREE.Group();
        let wallLoader = new THREE.OBJLoader();
        wallLoader.load( rockFile, ( modelObj )=> {
                modelObj.traverse( function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({color: 0xfafbfc, specular: 0xf00, shininess: 100,});
                        child.castShadow = true; //default is false
                        child.receiveShadow = true; //default is false
                        //console.log(child.name)

                        child.scale.set(1.5,1.5,1.5);
                    }
                })
                this.box3 = new THREE.Box3().setFromObject(modelObj) //Max and min of object
                this.groupWall.add( modelObj );
                this.scene.add( this.groupWall );
                this.modelObj = modelObj;
                this.onWindowResize()
            },
            (xhr) => {
                this.loadRockA = (xhr.loaded / xhr.total * 100);
                //document.querySelector('.load-progress').innerHTML = Math.floor(percent) +'%';
            },
            (error) => {
                console.log( 'An error happened' );
            }
        );
    }

       //BackROCK
       backRockLoader() {
        let wallLoader = new THREE.OBJLoader();
        wallLoader.load( rockFile, ( modelObj )=> {
                modelObj.traverse( function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({color: 0x111111, specular: 0xf00, shininess: 0, specular: 0x000,transparent: true, opacity:0});
                    }
                })
                this.box3 = new THREE.Box3().setFromObject(modelObj) //Max and min of object
                this.scene.add( modelObj );

                this.backRock = modelObj;

                this.backRock.position.set(0,0,-80)
                this.backRock.scale.set(.2,.2,.2)
                
                this.scene.add( this.backRock );

                //this.backRock.children[0].material.opacity = 0;

                //this.onWindowResize()
            },
            (xhr) => {
                this.loadRoackB = (xhr.loaded / xhr.total * 100);
                //document.querySelector('.load-progress').innerHTML = Math.floor(percent) +'%';
            },
            (error) => {
                console.log( 'An error happened' );
            }
        );
        
        //console.log('Group', this.backRock)
    }

    //SCROLL
    addEvents() {
        window.addEventListener('wheel', this.mouseWheel.bind(this));
        window.addEventListener('touchmove',this.touchMove.bind(this));
    }

    //PROFIL
    aboutPage() {
        let about = document.querySelector('.about-container');
        let tl = new TimelineLite();//Transition page
        tl.to(this.scene.position, 2, {z:80, ease:Circ.easeInOut},5/10)
          .to(about, .5, {opacity:1, visibility:'visible', ease:Circ.easeInOut}, 1, '+=.5')
          .addPause()
          .pause();

        let back = about.querySelector('.back-arrow');
        let returntxt = about.querySelector('.return');
        let name = about.querySelector('.name p');
        let contact = about.querySelectorAll('.contact a');
        let tltxt = new TimelineLite();
        tltxt.from(name, 2, {opacity:0, marginTop:'-40vh',ease:Circ.easeInOut},'+=1')
             .from(contact, 1, {opacity:0, marginTop:'-3vh', ease:Circ.easeInOut}, '-=.5')
             .from(back, 1, {opacity:0, marginTop:'-.5vh', ease:Circ.easeInOut}, '-=1.5')
             .from(returntxt, 2, {opacity:0, marginTop:'-.1vh', ease:Circ.easeInOut}, '-=1.75')
             .addPause()
             .pause();

        document.querySelector('.contact p').addEventListener('click',(e)=> {
            e.stopPropagation();
            new TypingEffect('.about-container .formation','0.05','+=1');
            new TypingEffect('.about-container .desc','0.015','+=0');
            new TypingEffect('.about-container .designer','0.05','+=1.5');
            tl.play();
            tltxt.play();
        })
        document.querySelector('.back-arrow').addEventListener('click',()=> {
            tl.reverse();
            tltxt.reverse();
        })
    }

    onNextWheel() {
        const index = (this.index + 1) %6;//NUMBER OF STEP
        this.goToIndex(index);
    }
    onPrevWheel() {
        let index = (this.index - 1) %6;//NUMBER OF STEP
        if(index == -1) {
            index = this.index + 5;
        }
        this.goToIndex(index);
    }

    next() {
        window.clearTimeout(this.carouselTimeout);
        this.animating = true;
        this.startCarouselTimeout();

        const add = Math.max(0, 1.52 - this.duration);
        const delay = this.scrolls.length > 5 ? add : this.delay; //25
        TweenMax.delayedCall(delay, () => {
            this.animating = false;
            this.scrolls = [];
        })
    }

    startCarouselTimeout() {
        this.carouselTimeout = setTimeout(() => {
            this.onNextWheel()
        }, 100)
    }

    previous() {
        window.clearTimeout(this.carouselTimeout);

        this.animating = true;
        this.backCarouselTimeout();

        const add = Math.max(0, 1.52 - this.duration);
        const delay = this.scrolls.length > 5 ? add : this.delay; //25
        TweenMax.delayedCall(delay, () => {
            this.animating = false;
            this.scrolls = [];
        })
    }

    backCarouselTimeout() {
        this.carouselTimeout = setTimeout(() => {
            this.onPrevWheel()
        }, 50)
    }
    touchMove(e) {
        //IF NOT IN PROJECT OR ABOUT MOBILE
        if(document.querySelector('.project-content')== null) {
            if(this.beginMove.length < 1) {
                this.beginMove.push(e.changedTouches["0"].clientY)
              }
              
              this.movement = this.beginMove[0]-e.changedTouches["0"].clientY;

                if(this.movement < 10 && this.movement > -80) {
                    setTimeout(()=> {
                        this.movement = "0";
                    },1000)
                    if(this.movement<-30) {
                        this.previous()     
                    }else {
                        this.next()
                    }
                }
        } else {
            //Move BackRock project       
            if(this.beginMove.length < 1) {
                this.beginMove.push(e.changedTouches["0"].clientY)
              }
              setTimeout(()=> {
                this.beginMove.shift();
              },1000)

             this.movement = this.beginMove[0]-e.changedTouches["0"].clientY;
             this.backRock.position.y -= this.movement/500
        }
    }

    mouseWheel(event) {
        //IF NOT IN PROJECT OR ABOUT
        if(document.querySelector('.project-content')== null) {
            const delta = event.deltaY
            if (!this.animating) {
                if (delta > 0) {
                    this.next()
                } else if (delta < 0) {
                    this.previous()
                }
            }
            this.scrolls.push(this.scrolls.length)
        } else {
            //Move BackRock project
            this.backRock.position.y += event.deltaY/150;            
        }
    }

    goToIndex(index) {
        this.index = index;
        const y = this.getWallPositionForIndex(index);
        TweenMax.to(this.groupWall.position, 2, { y, ease:Circ.easeInOut })

        //TEXT DISAPEAR
        if(index != 0) {
            TweenMax.to(this.fontMesh.material,2, { opacity: 0, ease:Circ.easeInOut})
        } else {
            TweenMax.to(this.fontMesh.material,2, { opacity: 1, ease:Circ.easeInOut})
        }
    }

    onMouseMove( event ) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        //console.log(this.scene.children)
        //NOMRAL LIGHT ON MOOVE
        TweenMax.to(bloomPass, .3, {strength:1, ease:Sine.easeOut});
        chromaticAberration.uniforms.uDistortion.value = .5;
        for ( var i = 0; i < this.planeGroup.children.length; i++ ) {
            //NO DEFORMATION PROJECT
            TweenMax.to(this.planeGroup.children[i].material.uniforms.uFrequency, .7, {value: 0., ease:Sine.easeInOut})
            TweenMax.to(this.planeGroup.children[i].material.uniforms.uAmplitude, .7, {value: 0., ease:Sine.easeInOut})
        }
    }

    planeGeometry(planeNumber, i) {
        let projectPic =[Ode,RundFromLove,Tinnitus,SabineExp,DataViz]

        const uniforms = {
            time: { type: "f", value: 0 },
            uAlpha: { type: "f", value: .55 },
            uFrequency: { type:"f", value: 0.},
            uAmplitude: { type:"f", value: 0.},
            resolution: {
                type: "v2",
                value: new THREE.Vector2(innerWidth, innerHeight)
            },
            mouse: { type: "v2", value: new THREE.Vector2(0, 0) },
            waveLength: { type: "f", value: 1.5 },
            texture1: {
                value: new THREE.TextureLoader().load(projectPic[i])
            }
        };
        const getMaterial = () => {
            return new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: uniforms,
                transparent:true,
                vertexShader:
                    ` varying vec2 vUv;
  
                  void main(){  
                    vUv = uv; 
                    //modelViewMatrix: es la posición y orientación de la cámara dentro de la escena
                    //projectionMatrix: la proyección para la escena de la cámara incluyendo el campo de visión
                    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * modelViewPosition;
                  }`,
                fragmentShader:
                    ` uniform float time;
                  uniform float uAlpha;
                  uniform float uFrequency;
                  uniform float uAmplitude;
                  uniform vec2 resolution;
                  uniform sampler2D texture1;
                  
                  varying vec2 vUv;
                  
                  void main() {  
                    vec2 uv1 = vUv;
                    // variable que contiene el eje de coordenadas
                    vec2 uv = gl_FragCoord.xy/resolution.xy;
                    
                    float frequency = uFrequency;
                    float amplitude = uAmplitude;
                    
                    float x = uv1.y * frequency + time * .7; 
                    float y = uv1.x * frequency + time * .3;
                    
                    uv1.x += cos(x+y) * amplitude * cos(y);
                    uv1.y += sin(x-y) * amplitude * cos(y);
                
                    vec4 rgba = texture2D(texture1, uv1);
                    gl_FragColor = rgba;
                    gl_FragColor *= uAlpha;
                  }`
            });
        };

        let planeGeo = new THREE.PlaneBufferGeometry( 50, 30, 10 );
        //let planeMat = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, transparent:true, opacity: 0.3} ); // 0.2 to SEE
        let planeMatS = getMaterial();
        planeMatS.opacity = 0.3;
        planeNumber = new THREE.Mesh( planeGeo, planeMatS );
        planeNumber.name = 'Plane'+i;

        this.planeGroup.add(planeNumber);
        this.groupWall.add(this.planeGroup);
    }

    planePosition() {
        //console.log(this.box3)
        const width = Math.abs(this.box3.min.x - this.box3.max.x)
        const height = Math.abs(this.box3.min.y - this.box3.max.y)
        const size = getPerspectiveSize(this.camera, this.camera.position.z); //Camera coord
        this.reScale = (size.width / (Math.abs(this.box3.max.x) + Math.abs(this.box3.min.x))) * 1.2;
        //DEPART ESTATE
        this.groupWall.getObjectByName('Plane0').material.map = new THREE.TextureLoader().load( RundFromLove );
        this.groupWall.getObjectByName('Plane0').scale.set(this.reScale*10.3, this.reScale*10.3, this.reScale*10.3)
        this.groupWall.getObjectByName('Plane0').position.set(-window.innerWidth/width*10,-10*(this.reScale*93),-1);

        this.groupWall.getObjectByName('Plane1').material.map = new THREE.TextureLoader().load( SabineExp );
        this.groupWall.getObjectByName('Plane1').scale.set(this.reScale*10.3, this.reScale*10.3, this.reScale*10.3)
        this.groupWall.getObjectByName('Plane1').position.set(window.innerWidth/width*10,-10*(this.reScale*133),-1);

        this.groupWall.getObjectByName('Plane2').material.map = new THREE.TextureLoader().load( canvasSound );
        this.groupWall.getObjectByName('Plane2').scale.set(this.reScale*10.35, this.reScale*10.35, this.reScale*10.35)
        this.groupWall.getObjectByName('Plane2').position.set(-window.innerWidth/width*6.5,-10*(this.reScale*171),-1);

        this.groupWall.getObjectByName('Plane3').material.map = new THREE.TextureLoader().load( DataViz );
        this.groupWall.getObjectByName('Plane3').scale.set(this.reScale*13, this.reScale*13, this.reScale*13)
        this.groupWall.getObjectByName('Plane3').position.set(window.innerWidth/width*3,-10*(this.reScale*211),-1);

        this.groupWall.getObjectByName('Plane4').material.map = new THREE.TextureLoader().load( Ode );
        this.groupWall.getObjectByName('Plane4').scale.set(this.reScale*10.35, this.reScale*10.35, this.reScale*10.35)
        this.groupWall.getObjectByName('Plane4').position.set(-window.innerWidth/width*12,-10*(this.reScale*258),-1);
    }

    //TWO PLANE BEGIN
    beginAnimation(planeAnim,i) {
        let planeGeo = new THREE.PlaneBufferGeometry( window.innerWidth/10 *(i+1), window.innerHeight/10, 10 );
        let planeMat = new THREE.MeshBasicMaterial( {color:0x000, side: THREE.FrontSide, transparent:true, opacity: 1} ); // 0.2 to SEE
        planeAnim = new THREE.Mesh( planeGeo, planeMat );
        planeAnim.name = 'PlaneAnim'+i

        this.scene.add(planeAnim);
    }
    //TWO PLANE ANIM AND DEZOOM SCENE
    positionAnimation() {
        this.scene.getObjectByName('PlaneAnim1').position.z = -75;
        this.scene.getObjectByName('PlaneAnim0').position.z = -75;
        this.scene.getObjectByName('PlaneAnim0').position.z = 10;
        this.scene.getObjectByName('PlaneAnim0').material.opacity = 1;
        let tl = new TimelineMax
        tl.to(this.scene.getObjectByName('PlaneAnim0').position, 2, { x:-window.innerWidth/4, ease:Circ.easeInOut },4.7/this.startTimer)//wall
            .to(this.scene.getObjectByName('PlaneAnim1').position, 4, { x:window.innerWidth/4, ease:Circ.linear },5/this.startTimer)//txt
            .from(this.scene.position,2, {z:80, ease:Circ.easeInOut},5/this.startTimer)
    }


    //AFTER ELEMENT LOADED
    loaded() {
        //Temps de transition affichage text apres le load à 100%;
        document.querySelector('.load-progress').remove();
        document.querySelector('.intro-txt').style.display = "block";

        //TYPING TEXT EFFECT
        new TypingEffect('.welcome','0.05','+=0','.intro');

        setTimeout(()=>{
            //temps de transition remove
            document.querySelector('.loader').classList.add('remove-scene');
            setTimeout(()=> {
                document.querySelector('.loader').remove();
            },500)//remove
            //},5000)//txt
        },5000/this.startTimer)//txt
    }

    projectPage(templateProject) {
        document.querySelector('.project-container').innerHTML = templateProject;

        let project = document.querySelector('.project-container');
        let tl = new TimelineLite();//Transition projectPage
        tl.to(project, .5, {opacity:1, visibility:'visible', ease:Circ.easeInOut}, 1, '+=.5')
            .addPause()
            .pause();

            new TypingEffect('.project-content .title','0.05','+=1');
            new TypingEffect('.project-content .desc','0.03','-=1.2');
            new TypingEffect('.project-content .see-more .date','0.05','+=1.5');
            new TypingEffect('.project-content .see-more .link','0.05','+=1.2');
            tl.play();
        
        let tlRow = new TimelineLite()
        tlRow.staggerFrom(document.querySelectorAll('.row'),0.5, {autoAlpha:0},'0.5','+=1')
             .staggerFrom(document.querySelectorAll('.img-row'),1, {autoAlpha:0},'0.5','-=0.5')


    }
    //REQUEST ANIMATION LOOP
    render() {
        if(this.inProjectUpdate == true) {
            //Update Scroll deform
            this.projectDeformContent.loop();
            TweenMax.to(bloomPass, .3, {strength:0.4,threshold: 0.75, ease:Sine.easeOut}).delay(1);
        }
        //RAYCASTER
        this.raycaster.setFromCamera( this.mouse, this.camera );
        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects( this.planeGroup.children );

        document.body.style.cursor = "default";
        for ( let i = 0; i < this.intersects.length; i++ ) {

            //POWER LIGHT ON HOVER
            TweenMax.to(bloomPass, .3, {strength:1.5, ease:Sine.easeOut});
            chromaticAberration.uniforms.uDistortion.value = 2.;
            document.body.style.cursor = "pointer";
            //console.log(this.intersects[0].object)

            //ACTUALISE WAVE ON HOVER
            this.waterDeform += 0.1;
            TweenMax.to(this.intersects[0].object.material.uniforms.time, .7, {value:this.waterDeform, ease:Sine.easeInOut})
            TweenMax.to(this.intersects[0].object.material.uniforms.uFrequency, .7, {value: 15., ease:Sine.easeInOut})
            TweenMax.to(this.intersects[0].object.material.uniforms.uAmplitude, .7, {value: .15, ease:Sine.easeInOut})

            //CLICK ON PROJECT
            document.body.addEventListener('click', () => {
                if(this.scene.position.z != 80 && this.inProject == false && this.intersects[0].object.name != 'Plane4') { //Locked click for in progress
                    if (this.intersects.length != 0 && this.intersects[0].object.name == 'Plane' + i) {
                        //console.log(this.intersects[0].object)
                        let title = document.querySelector('.txt-container')
                        let tl = new TimelineLite();
                        tl.to(this.scene.position, 2, {z:80, ease:Circ.easeInOut}) //ZOOM
                            .to(title, 2, {opacity:0, ease:Circ.easeInOut}, '-=2') // DISAPPEAR TITLE
                            .to(title, 1, {visibility:'hidden', ease:Circ.easeInOut}) // DISAPPEAR TITLE
                            .addPause().pause()
                        tl.play()
                        this.inProjectUpdate = true;

                        //BACKROCK OPACITY
                        TweenMax.to(this.backRock.children[0].material, .8, {opacity: 1, ease:Sine.easeInOut})

                        //console.log('Zoom project')
                        switch (this.intersects[0].object.name) {
                            case 'Plane0':
                                this.projectPage(firstProjectContent);
                                //window.history.pushState('Project', 'RunFromLove', '/Project_01');
                                this.projectDeformContent = new ProjectDeformContent(this.scene, 0, 5);
                                break;
                            case 'Plane1':
                                this.projectPage(secProjectContent);
                                //window.history.pushState('Project', 'SabineExp', '/Project_02');
                                this.projectDeformContent = new ProjectDeformContent(this.scene , 1, 3);
                                break;
                            case 'Plane2':
                                this.projectPage(thirdProjectContent);
                                //window.history.pushState('Project', 'CanvasSound', '/Project_03');
                                this.projectDeformContent = new ProjectDeformContent(this.scene , 2, 3);
                                break;
                            case 'Plane3':
                                this.projectPage(fourthProjectContent);
                                //window.history.pushState('Project', 'DataViz', '/Project_04');
                                this.projectDeformContent = new ProjectDeformContent(this.scene , 3 , 3);
                                break;
                            case 'Plane4':
                                this.projectPage(fifthProjectContent);
                                //window.history.pushState('Project', 'Ode', '/Project_05');
                                this.projectDeformContent = new ProjectDeformContent(this.scene , 4, 3);
                                break;
                            default:
                        }
                        this.inProject = true;
                    }
                }
            })
            //REMOVE PROJECT PAGE
            if (this.inProject == true) {
                this.inProject = false;
                document.querySelector('.project-arrow').addEventListener('click', () => {
                    window.history.pushState('Home', 'Home', '/');
                    let project = document.querySelector('.project-container');
                    let tlOpacity = new TimelineLite();//Transition page
                    //Remove txt
                    tlOpacity.to(document.querySelectorAll('.row'),0.25, {autoAlpha:0},'0.5','+=1')
                             .to(document.querySelectorAll('.img-row'),0.5, {autoAlpha:0},'0.5','-=0.5')
                             .to(project, .25, {opacity:0, visibility:'hidden', ease:Circ.easeInOut}, 1, '+=.5')
                             .addPause().pause();
                    tlOpacity.play();
                    //BACKROCK OPACITY
                    TweenMax.to(this.backRock.children[0].material, .7, {opacity: 0, ease:Sine.easeInOut})
                    //Replace camera
                    let title = document.querySelector('.txt-container')
                    let tl = new TimelineLite();
                    tl.to(this.scene.position, 2, {z:0, ease:Circ.easeInOut}) //UNZOOM
                        .to(title, .2, {visibility:'visible', ease:Circ.easeInOut},'-=1') //REAPPEAR TITLE
                        .to(title, 1, {opacity:1, ease:Circ.easeInOut}, '-=1.2' ) //REAPPEAR TITLE
                        .addPause().pause();
                    tl.play();
                    //console.log('Unzoom project')

                    //Remove Project Deform
                    this.inProjectUpdate = false;
                    this.projectDeformContent.remove()
                    TweenMax.to(bloomPass, 1, {strength:1,threshold: 0, ease:Sine.easeOut}).delay(1);

                    //REMOVE CONTENT
                    setTimeout(()=> {
                        document.querySelector('.project-container').innerHTML = ''
                    },1500)
                })
            }
        }


        let time = Date.now()/1000;// rayon
        this.dirLight.position.x += Math.cos(time)/2;
        this.dirLight.position.y += Math.sin(time)/2;
        //this.dirLight.position.z += Math.tan(time);
        this.targetObject.position.x += Math.cos(time)/2;
        this.targetObject.position.y += Math.sin(time)/2;


        this.baseLight.position.x -= Math.cos(time)/2;
        this.baseLight.position.y -= Math.sin(time)/2;

        //RENDER
        //this.renderer.render( this.scene, this.camera ); //Default
        composer.render();
    }

    resizeParameters() {
        const size = getPerspectiveSize(this.camera, this.camera.position.z); //Camera coord
        this.reScale = (size.width / (Math.abs(this.box3.max.x) + Math.abs(this.box3.min.x))) * 1.2;
        this.modelObj.scale.set(this.reScale, this.reScale, this.reScale)
        this.currentBox3 = new THREE.Box3().setFromObject(this.modelObj)

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        composer.setSize( window.innerWidth, window.innerHeight );

        this.chromaticAberrationPass.uniforms.resolution.value.x = window.innerWidth;
        this.chromaticAberrationPass.uniforms.resolution.value.y = window.innerHeight;
         if(this.fontMesh) {
            if(window.matchMedia('(max-width:800px)').matches) {
                this.fontMesh.scale.set(.5,.5,.5);
                this.fontMesh.position.set(-35,5,-81);
            } else {
                this.fontMesh.scale.set(1,1,1);
                this.fontMesh.position.set(-70,17,-81);
            }
        }
    }

    onWindowResize(resizeWindow) {
        this.resizeParameters();

        if(resizeWindow != true) {
            this.setWallPosition();
        } else {
            this.resizeParameters();
            this.planePosition();
        }
    }

    setWallPosition() {
        const index = this.index;
        const y = this.getWallPositionForIndex(index);

        this.modelObj.position.y = y;
    }

    getWallPositionForIndex(index) {
        if (index === 0) {
            //NEW CONTENT
            document.querySelector('.txt-container').classList.remove('project-container-migi');
            document.querySelector('.txt-container').classList.add('mobile-intro-container');
            document.querySelector('.txt-container').innerHTML = firstSceneTemplate;
            new TypingEffect('.hidari .txt-f','0.05','+=2','.hidari .txt-s','.migi .txt-f','-=0', '.migi .txt-s','-=0');

            return 0
        }
        else {
            if(document.querySelector('.mobile-intro-container')) {
                document.querySelector('.txt-container').classList.remove('mobile-intro-container');
            }
            for (let i = 0; i<this.wallObj.children.length; i++) {
                const child = this.wallObj.children[i]
                let name = child.name;
                name = name.substring(0,11);
                if(name == 'Project'+index+'Pos') {
                    const v3 = new THREE.Vector3(
                        child.geometry.attributes.position.array[0],//x
                        child.geometry.attributes.position.array[1],//y
                        child.geometry.attributes.position.array[2]//z
                    )
                    v3.y *= -this.reScale
                    this.infoProject(index);
                    return v3.y
                }
            }

        }
    }

    infoProject(index) {
        switch ('Project'+index) {
            case 'Project1':
                this.newContent(secSceneTemplate, 'migi', 'hidari');
                break;
            case 'Project2':
                this.newContent(thirdSceneTemplate, 'hidari', 'migi');
                break;
            case 'Project3':
                this.newContent(fourthSceneTemplate, 'migi', 'hidari');
                break;
            case 'Project4':
                this.newContent(fifthSceneTemplate, 'hidari', 'migi');
                break;
            case 'Project5':
                this.newContent(sixthSceneTemplate, 'migi', 'hidari');
                break;
            default:
        }
    }

    newContent(sceneTemplateNumber, newSide, removalSide) {
        document.querySelector('.txt-container').classList.remove('project-container-'+ removalSide);
        document.querySelector('.txt-container').classList.add('project-container-'+ newSide);
        document.querySelector('.txt-container').innerHTML = sceneTemplateNumber;
        new TypingEffect('.project-info .title','0.05','+=2','.project-info .desc','.project-info .date','-=1.5');
    }

    addComposer() {
        //composer
        composer = new THREE.EffectComposer(this.renderer);

        //passes
        renderPass = new THREE.RenderPass(this.scene, this.camera);

        chromaticAberration = {
            uniforms: {
                uDistortion: { type: "f", value: .5 },
                tDiffuse: { type: "t", value: null },
                resolution: {
                    value: new THREE.Vector2(
                        window.innerWidth,
                        window.innerHeight
                    )
                },
                power: { value: 0.5 }
            },

            vertexShader: `
    
        varying vec2 vUv;
    
        void main() {
    
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
        }
        `,

            fragmentShader: `
			uniform sampler2D tDiffuse;
			uniform vec2 resolution;
			uniform float uDistortion;

			vec2 barrelDistortion(vec2 coord, float amt) {
				vec2 cc = coord - 0.5;
				float dist = dot(cc, cc);
				return coord + cc * dist * amt;
			}

			float sat( float t )
			{
				return clamp( t, 0.0, 1.0 );
			}

			float linterp( float t ) {
				return sat( 1.0 - abs( 2.0*t - 1.0 ) );
			}

			float remap( float t, float a, float b ) {
				return sat( (t - a) / (b - a) );
			}

			vec4 spectrum_offset( float t ) {
				vec4 ret;
				float lo = step(t,0.5);
				float hi = 1.0-lo;
				float w = linterp( remap( t, 1.0/6.0, 5.0/7.0 ) );
				ret = vec4(lo,1.0,hi, 1.) * vec4(1.0-w, w, 1.0-w, 1.);

				return pow( ret, vec4(1.0/2.2) );
			}

			const float max_distort = .5;
			const int num_iter = 12;
			const float reci_num_iter_f = 1.0 / float(num_iter);

			void main()
			{	
				vec2 uv=(gl_FragCoord.xy/resolution.xy);

				vec4 sumcol = vec4(0.0);
				vec4 sumw = vec4(0.0);	
				for ( int i=0; i<num_iter;++i )
				{
					float t = float(i) * reci_num_iter_f;
					vec4 w = spectrum_offset( t );
					sumw += w;
					sumcol += w * texture2D( tDiffuse, barrelDistortion(uv, .6 * uDistortion*t ) );
				}

				gl_FragColor = sumcol / sumw;
			}
      `
        };
        //DEFAULT
        //const float max_distort = 2.2;

        chromaticAberrationPass = new THREE.ShaderPass(chromaticAberration);
        this.chromaticAberrationPass = chromaticAberrationPass;


        bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        let antialiasPass = new THREE.ShaderPass(THREE.FXAAShader);

        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.addPass(chromaticAberrationPass);
        composer.addPass(antialiasPass);
        antialiasPass.renderToScreen = true;
    }
}