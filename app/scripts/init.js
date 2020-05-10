import objFile from '../assets/models/modelObj.obj';
import rockFile from '../assets/models/Morceaux_01.obj';
import rockFile2 from '../assets/models/Morceaux_02.obj';
import fontFile from '../assets/fonts/Avenir.json';
import Ode from '../assets/img/project/OdeScreen.jpg';
import RundFromLove from '../assets/img/project/RunFromLoveScreen.jpg';
import SabineExp from '../assets/img/project/SabineScreen.jpg';
import Tinnitus from '../assets/img/project/TinnitusScreen.png';
import JapMap from '../assets/img/project/WLDLGHTScreen.jpg';
import canvasSound from '../assets/img/project/CanvasSoundScreen.jpg';
import { TweenMax, Power2, TimelineLite } from 'gsap/TweenMax';
import { GLTFLoader } from 'three/examples/js/loaders/GLTFLoader';
import { clamp, map } from '../scripts/utils/math';

let OrbitControls = require('three-orbit-controls')(THREE)

import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/shaders/DotScreenShader';
import 'three/examples/js/shaders/LuminosityHighPassShader';
import 'three/examples/js/postprocessing/UnrealBloomPass';
import 'three/examples/js/shaders/FXAAShader.js';

import { TimelineMax, Power4 } from 'gsap';

// UTILS CLASS
import { getPerspectiveSize } from './utils/3d';
import TypingEffect from './TypingEffect';
import ProjectDeformContent from './ProjectDeformContent';

//SHADER
import noiseDeformVertex from './Shader/NoiseDeform/vertexShader.glsl';
import noiseDeformFragment from './Shader/NoiseDeform/fragmentShader.glsl';
import chromaVertex from './Shader/Chroma/vertexShader.glsl';
import chromaFragment from './Shader/Chroma/fragmentShader.glsl';

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

let templates = [firstProjectContent, secProjectContent, thirdProjectContent, fourthProjectContent, fifthProjectContent];

let composer, renderPass, bloomPass, chromaticAberration, chromaticAberrationPass;
let params = {
    exposure: 0,
    bloomStrength: 0.9,
    bloomThreshold: 0,
    bloomRadius: .4
};

export default class App {

    constructor() {

        this.lastIndex = 0;
        this.index = 0;
        this.timerStep = 0;
        this.startTimer = 10; //10 Fast 1 Normal
        this.scrolls = [];
        this.wallAnchors = [];
        this.duration = .5;
        this.delay = 0;
        this.waterDeform = 0;
        this.wallTargetPosition = 0;
        
        this.groupWallPlanes = [];
        
        //Device
        this.fx = typeof InstallTrigger !== 'undefined';
        this.isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
        this.device;
        this.scrollOffset = 0;
        this.isScrolling = false;

        //scroll
        this.delta = 0;
        this.backRockScroll = false;
        this.lockToIndex = false;

        this.rotateCam = true;
        this.movementX = 0;
        this.movementY = 0;

        //Load
        this.percentLoad = 0;
        this.loadRoackA = 0;
        this.loadRoackB = 0;
        this.loadWall = 0;

        //Page
        this.inProject = false;
        this.inProjectUpdate = false;
        this.inAbout = false;

        //Mobile
        this.beginMove = [];
        this.movement = 0;

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        this.mouse = new THREE.Vector2();
        this.stopProp = false;
        this.ignore = document.querySelector('.about-container')
        this.ignoreTo = document.querySelector('.stop-prop')

        //THREE SCENE
        this.container = document.querySelector( '#main' );
        this.textContainer = this.container.querySelector('.txt-container');
        this.contact = this.container.querySelector('.contact');
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
        wallLoader.load( rockFile2, ( modelObj )=> {
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
        window.addEventListener('wheel', this.getDevice.bind(this));
        window.addEventListener('touchmove',this.touchMove.bind(this));
        if(this.isMacLike) {
            document.body.addEventListener('click', this.goToproject.bind(this));
        } else {
            document.body.addEventListener('touchend', this.goToproject.bind(this));
        }
    }

    getDevice(e) {
        this.scrollOffset = 0;
        let isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0
        let chrome = e.wheelDeltaY;
        this.scrollOffset += e.deltaY;
        // let isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
        // if(isMacLike) {
        //     console.log('MAC DEVICE DETECTED')
        // } else {
        //     console.log('WINDOWS DEVICE DETECTED')
        // }
        if(chrome) {//Chrome
            if(isTouchPad) {//touchpad
              this.device = "ct";
            } else {//mouse
              this.device = "cm";
            }
          }
          if(!chrome && e.deltaY) {//Mozilla
            if(isTouchPad) {//touchpad
              this.device = "mt";
            } else {//mouse
              this.device = "mm";
            }
          }
    }

    //PROFIL
    aboutPage() {
        let about = document.querySelector('.about-container');

        let tl = new TimelineLite();//Transition page
        tl.to(this.scene.position, 2, {z:90, ease:Circ.easeInOut},5/10)
          .to(about, .5, {opacity:1, visibility:'visible', ease:Circ.easeInOut}, 1, '+=.5')
          .addPause()
          .pause();

        let tlInproject = new TimelineLite();//Transition page
        tlInproject.to(this.scene.position, 2, {z:0, ease:Circ.easeInOut},5/10)
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
        if(this.isMacLike) {
            document.querySelector('.contact p').addEventListener('touchend',(e)=> {

                e.stopPropagation();
                new TypingEffect('.about-container .formation','0.05','+=1');
                new TypingEffect('.about-container .desc','0.015','+=0');
                new TypingEffect('.about-container .designer','0.05','+=1.5');
                this.scene.position.z < 10 ? tl.play() : tlInproject.play();
                // tl.play();
                tltxt.play();
                this.inAbout = true;
            })
        }
        else {
            document.querySelector('.contact p').addEventListener('click',(e)=> {

            e.stopPropagation();
            new TypingEffect('.about-container .formation','0.05','+=1');
            new TypingEffect('.about-container .desc','0.015','+=0');
            new TypingEffect('.about-container .designer','0.05','+=1.5');
            this.scene.position.z < 10 ? tl.play() : tlInproject.play();
            // tl.play();
            tltxt.play();
            this.inAbout = true;
        })
    }
        document.querySelector('.back-arrow').addEventListener('click',()=> {
            this.scene.position.z > 85 ? tl.reverse() : tlInproject.reverse();
            // tl.reverse();
            tltxt.reverse();
            this.inAbout = false;
        })
    }

    touchMove(e) {
        this.isScrolling = true;
        //IF NOT IN PROJECT OR ABOUT MOBILE
        if(document.querySelector('.project-content')== null) {
            if(this.beginMove.length < 1) {
              this.beginMove.push(e.changedTouches["0"].clientY)
            }
            let movement = this.beginMove[0]-e.changedTouches["0"].clientY;
            if(this.isMacLike) {
                this.wallTargetPosition += movement * 0.03; //Ios
            } else {
                this.wallTargetPosition += movement * 0.1; //real 0.1 for test 0.02
            }
            setTimeout(()=> {
                this.beginMove = [];
              },500)
        } else {
            //Move BackRock project       
            if(this.beginMove.length < 1) {
                this.beginMove.push(e.changedTouches["0"].clientY)
              }
              setTimeout(()=> {
                this.beginMove.shift();
              },1000)

            

            let lockSCroll = this.projectDeformContent.getLimit()
            if(!lockSCroll) {
                this.movement = this.beginMove[0]-e.changedTouches["0"].clientY;
                this.delta += this.movement/600;
                this.backRockScroll = true;
            }   
        }
        window.addEventListener('touchend',()=> {
            this.isScrolling = false;
        })
    }

    mouseWheel(event) {
        //IF NOT IN PROJECT OR ABOUT
        if(document.querySelector('.project-content')== null) {  // HOME
            if(!this.isMacLike) {
                if(this.device == "mm") {//mozilla mouse
                    this.wallTargetPosition += event.deltaY * 1.8;
                } 
                if(this.device == "cm") {//chrome mouse
                    this.wallTargetPosition += event.deltaY * 0.08;
                } 
                if(this.device != "mm" && this.device != "cm") {//others
                    this.wallTargetPosition += event.deltaY * .03;
                }
            } else {
                if(this.device == "mm") {//mozilla mouse
                    this.wallTargetPosition += event.deltaY * .9;
                } else {//others
                    this.wallTargetPosition += event.deltaY * .03;
                }
            }
            //Remove fontMesh onScroll
            if(this.wallTargetPosition > 20) {
                this.fontMesh.material.opacity = 0;
                //TweenMax.to(this.fontMesh.material, .5, { opacity: 0, ease:Circ.easeInOut})
            }
        } else {
            //Move BackRock project
            //this.backRock.position.y += event.deltaY/150;  
            let lockSCroll = this.projectDeformContent.getLimit()
            if(!lockSCroll) {
                if(!this.isMacLike && this.device == 'mm') {
                    this.delta += event.deltaY * 0.275;
                } else {
                    this.delta += event.deltaY * 0.0075;
                }
                this.backRockScroll = true;
            }   
        }
    }

   

    onMouseMove( event ) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        //console.log(this.scene.children)
        //NOMRAL LIGHT ON MOOVE
        TweenMax.to(bloomPass, .3, {strength:0.9, ease:Sine.easeOut});
        chromaticAberration.uniforms.uDistortion.value = .3;
        for ( var i = 0; i < this.planeGroup.children.length; i++ ) {
            //NO DEFORMATION PROJECT
            TweenMax.to(this.planeGroup.children[i].material.uniforms.uFrequency, .7, {value: 0., ease:Sine.easeInOut})
            TweenMax.to(this.planeGroup.children[i].material.uniforms.uAmplitude, .7, {value: 0., ease:Sine.easeInOut})
        }
        this.movementX -= event.movementX/40000;
        this.movementY -= event.movementY/40000;
    }

    planeGeometry(planeNumber, i) {
        let projectPic =[Ode,RundFromLove,Tinnitus,SabineExp,JapMap]

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
                vertexShader: noiseDeformVertex,
                fragmentShader: noiseDeformFragment
            });
        };

        let planeGeo = new THREE.PlaneBufferGeometry( 50, 30, 10 );
        //let planeMat = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, transparent:true, opacity: 0.3} ); // 0.2 to SEE
        let planeMatS = getMaterial();
        planeMatS.opacity = 0.3;
        planeNumber = new THREE.Mesh( planeGeo, planeMatS );
        planeNumber.name = 'Plane'+i;
        planeNumber.index = i;

        this.planeGroup.add(planeNumber);
        this.groupWallPlanes.push(planeNumber)
        this.groupWall.add(this.planeGroup);
    }

    planePosition() {
        //console.log(this.box3)
        const width = Math.abs(this.box3.min.x - this.box3.max.x)
        const height = Math.abs(this.box3.min.y - this.box3.max.y)
        const size = getPerspectiveSize(this.camera, this.camera.position.z); //Camera coord
        this.reScale = (size.width / (Math.abs(this.box3.max.x) + Math.abs(this.box3.min.x))) * 1.2;
        //DEPART ESTATE
        this.groupWallPlanes[0].material.map = new THREE.TextureLoader().load( RundFromLove );
        this.groupWallPlanes[0].scale.set(this.reScale*10.3, this.reScale*10.3, this.reScale*10.3)
        this.groupWallPlanes[0].position.set(-window.innerWidth/width*10,-10*(this.reScale*93),-1);

        this.groupWallPlanes[1].material.map = new THREE.TextureLoader().load( SabineExp );
        this.groupWallPlanes[1].scale.set(this.reScale*10.3, this.reScale*10.3, this.reScale*10.3)
        this.groupWallPlanes[1].position.set(window.innerWidth/width*10,-10*(this.reScale*133),-1);

        this.groupWallPlanes[2].material.map = new THREE.TextureLoader().load( canvasSound );
        this.groupWallPlanes[2].scale.set(this.reScale*10.35, this.reScale*10.35, this.reScale*10.35)
        this.groupWallPlanes[2].position.set(-window.innerWidth/width*6.5,-10*(this.reScale*171),-1);

        this.groupWallPlanes[3].material.map = new THREE.TextureLoader().load( JapMap );
        this.groupWallPlanes[3].scale.set(this.reScale*13, this.reScale*13, this.reScale*13)
        this.groupWallPlanes[3].position.set(window.innerWidth/width*3,-10*(this.reScale*211),-1);

        this.groupWallPlanes[4].material.map = new THREE.TextureLoader().load( Ode );
        this.groupWallPlanes[4].scale.set(this.reScale*10.35, this.reScale*10.35, this.reScale*10.35)
        this.groupWallPlanes[4].position.set(-window.innerWidth/width*12,-10*(this.reScale*258),-1);
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

        // AJOUTE LE CLICK
        if(this.isMacLike) {
            document.querySelector('.project-arrow').addEventListener('touchend', () => {
                this.backToHome()
            })
        } else {
            document.querySelector('.project-arrow').addEventListener('click', () => {
                this.backToHome()
            })
        }
    }

    backToHome() {
        //window.history.pushState('Home', 'Home', '/');
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
        if(window.matchMedia('(max-width:800px)').matches) {
            tl.to(this.scene.position, 2, {z:0, ease:Circ.easeInOut}) //UNZOOM
                .to(title, .2, {visibility:'visible', ease:Circ.easeInOut},'-=1') //REAPPEAR TITLE
                .to(title, 1, {opacity:1, ease:Circ.easeInOut}, '-=1.2' ) //REAPPEAR TITLE
                .addPause().pause();
        } else {
            tl.to(this.scene.position, 2, {z:0, ease:Circ.easeInOut}) //UNZOOM
            .to(title, .2, {visibility:'visible', ease:Circ.easeInOut},'-=1') //REAPPEAR TITLE
            .to(title, 1, {opacity:1, ease:Circ.easeInOut}, '-=1.2' ) //REAPPEAR TITLE
            .addPause().pause();
        }
        tl.play();
        //console.log('Unzoom project')
        
        //Remove Project Deform
        this.inProjectUpdate = false;
        this.projectDeformContent.remove()
        TweenMax.to(bloomPass, 1, {strength:0.9,threshold: 0, ease:Sine.easeOut}).delay(1);
        this.rotateCam = true;

        //REMOVE CONTENT
        setTimeout(()=> {
            this.inProject = false;
            document.querySelector('.project-container').innerHTML = ''
        },1500)
    }

    goToproject(ev) {
        let target = ev.target;
        //Lock no intersect / in project / about mobile click
        if (!this.intersecting || this.inProject || target === this.ignore || this.ignore.contains(target) || target === this.ignoreTo || this.ignoreTo.contains(target)) return;

        if(this.isScrolling == false && this.inAbout == false) {
            
            const firstIntersect = this.intersects[0];

            if (this.inProject == false && firstIntersect.object.index != 4) { //Locked click for in progress
                //console.log(firstIntersect.object)
                let title = this.textContainer
                let tl = new TimelineLite();
                if(window.matchMedia('(max-width:800px)').matches) {
                    tl.to(this.scene.position, 2, {z:80, ease:Circ.easeInOut}) //ZOOM
                        .to(title, 2, {opacity:0, ease:Circ.easeInOut}, '-=2') // DISAPPEAR TITLE
                        .to(title, 1, {visibility:'hidden', ease:Circ.easeInOut}) // DISAPPEAR TITLE
                        .addPause().pause()
                } else {
                    tl.to(this.scene.position, 2, {z:80, ease:Circ.easeInOut}) //ZOOM
                        .to(title, 2, {opacity:0, ease:Circ.easeInOut}, '-=2') // DISAPPEAR TITLE
                        .to(title, 1, {visibility:'hidden', ease:Circ.easeInOut}) // DISAPPEAR TITLE
                        .addPause().pause()
                }
                tl.play()
                this.inProjectUpdate = true;
                this.rotateCam = false;

                //BACKROCK OPACITY
                TweenMax.to(this.backRock.children[0].material, .8, {opacity: 1, ease:Sine.easeInOut})
                
                let index = firstIntersect.object.index;

                if (typeof index !== 'undefined') {
                    this.projectPage(templates[index]);
                    this.projectDeformContent = new ProjectDeformContent(this.scene, index);
                    this.inProject = true;
                }
                
            }
        }
        this.isScrolling = false;
    }

    raycast() {
        this.raycaster.setFromCamera( this.mouse, this.camera );
        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects( this.planeGroup.children );
        if (this.intersects.length <= 0) {
            document.body.style.cursor = "default";
            this.intersecting = false;
            return;
        }

        this.intersecting = true;

       
        for ( let i = 0; i < this.intersects.length; i++ ) {

            //POWER LIGHT ON HOVER
            //If project diff from sabine (White plane so much light)
            this.intersects[0].object.name != "Plane3" ? TweenMax.to(bloomPass, .3, {strength:1.5, ease:Sine.easeOut}) : TweenMax.to(bloomPass, .3, {strength:1.2, ease:Sine.easeOut});
            // TweenMax.to(bloomPass, .3, {strength:1.4, ease:Sine.easeOut});
            chromaticAberration.uniforms.uDistortion.value = 1.5;
            document.body.style.cursor = "pointer";
            // console.log(this.intersects[0].object)

            //ACTUALISE WAVE ON HOVER
            this.waterDeform += 0.1;
            TweenMax.to(this.intersects[0].object.material.uniforms.time, .7, {value:this.waterDeform, ease:Sine.easeInOut})
            TweenMax.to(this.intersects[0].object.material.uniforms.uFrequency, .7, {value: 15., ease:Sine.easeInOut})
            TweenMax.to(this.intersects[0].object.material.uniforms.uAmplitude, .7, {value: .15, ease:Sine.easeInOut})


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
                    let title = this.textContainer
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
                    TweenMax.to(bloomPass, 1, {strength:0.9,threshold: 0, ease:Sine.easeOut}).delay(1);
                    this.rotateCam = true;

                    //REMOVE CONTENT
                    setTimeout(()=> {
                        document.querySelector('.project-container').innerHTML = ''
                    },1500)
                })
            }
        }

    }

    //REQUEST ANIMATION LOOP
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

        // this.lockToIndex = false;
        this.getWallPositions();
        this.wallTargetPosition = this.wallAnchors[this.lastIndex];

    }

    getWallPositions() {
        if (!this.wallObj) return;
        this.wallAnchors[0] = 0;
        
        for (let i = 0; i<this.wallObj.children.length; i++) {
            const child = this.wallObj.children[i]
            let name = child.name;
            name = name.substring(0,11);
            if(name.indexOf('Pos') > -1) {
                name = name.replace('Project', '');
                let index = parseInt(name, 10);
                if (isNaN(index)) continue;
                let y = child.geometry.attributes.position.array[1];
                if(this.fx) {
                    this.wallAnchors[index] = y * -this.reScale + (index * 5); //Mozilla + (index * 5)
                } else {
                    this.wallAnchors[index] = y * -this.reScale; //Chrome
                }
            }
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
            this.textContainer.classList.remove('project-container-migi');
            this.textContainer.classList.add('mobile-intro-container');
            this.textContainer.innerHTML = firstSceneTemplate;
            new TypingEffect('.hidari .txt-f','0.05','+=2','.hidari .txt-s','.migi .txt-f','-=0', '.migi .txt-s','-=0');
            return 0
        }
        else {
            if(document.querySelector('.mobile-intro-container')) {
                this.textContainer.classList.remove('mobile-intro-container');
            }
        }
    }

    animateInfoProject(index) {
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
        this.textContainer.classList.remove('project-container-'+ removalSide);
        this.textContainer.classList.add('project-container-'+ newSide);
        this.textContainer.innerHTML = sceneTemplateNumber;
        new TypingEffect('.project-info .title','0.05', .1,'.project-info .desc','.project-info .date', .6);
    }

    addComposer() {
        //composer
        composer = new THREE.EffectComposer(this.renderer);

        //passes
        renderPass = new THREE.RenderPass(this.scene, this.camera);

        chromaticAberration = {
            uniforms: {
                uDistortion: { type: "f", value: .3 },
                tDiffuse: { type: "t", value: null },
                resolution: {
                    value: new THREE.Vector2(
                        window.innerWidth,
                        window.innerHeight
                    )
                },
                power: { value: 0.4 }
            },
            vertexShader: chromaVertex,
            fragmentShader: chromaFragment
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

    updateWall() {
        if (!this.modelObj) return;
        //Clamp lock a value beetween min and max
        let y = clamp(this.wallTargetPosition, this.wallAnchors[0], this.wallAnchors[this.wallAnchors.length - 1] + 10);
        if (isNaN(y)) return;
        this.wallTargetPosition = y;
        let delta = this.wallTargetPosition - this.groupWall.position.y;
        this.groupWall.position.y += delta * .1;

        if (Math.abs(delta) < .5 && !this.lockToIndex) {
            this.lockToIndex = true;
            let index = this.getCloserIndex();
            
            // set position
            let targetY = this.wallAnchors[index];
            this.wallTargetPosition = targetY;
            
            // animationIn
            this.animateBlockIn(index)
        } else if (Math.abs(delta) > .5 && this.lockToIndex) {
            this.lockToIndex = false;
            this.animateBlockOut();
        }
    }

    getCloserIndex() {
        let current = this.groupWall.position.y;

        // 0 is purpose to be the closest
        let index = 0;
        let minDistance = Infinity;

        for (let i = 0, l = this.wallAnchors.length; i < l; i++) {
            let distance = Math.abs(current - this.wallAnchors[i]);
            if (distance < minDistance) {
                minDistance = distance;
                index = i;
            }
        }


        //scroll to 1 if 10% + & go back if x < 80%
        let remap = map(current, 0, this.wallAnchors[1], 0, 1);
        if (index === 0) {
            if (remap > .1 && remap < 1.) {
                index = 1;
            }
        } else if (index === 1 && remap < .7) {
            index = 0;
        }

        return index
    }

    animateBlockIn(index) {
        this.lastIndex = index;
        if (this.lastAnimateInIndex === index) return;
        this.lastAnimateInIndex = index;

        TweenMax.to(this.textContainer, .3, { autoAlpha: 1 }, Cubic.easeOut);
        
        if (index === 0) {
            this.textContainer.classList.remove('project-container-migi');
            this.textContainer.classList.add('mobile-intro-container');
            this.textContainer.innerHTML = firstSceneTemplate;
            new TypingEffect('.hidari .txt-f','0.05', 0,'.hidari .txt-s','.migi .txt-f','-=0', '.migi .txt-s', 0);
            if(this.fontMesh) TweenMax.to(this.fontMesh.material,.5, { opacity: 1, ease:Circ.easeInOut})// fontMesh appear

            //Appear contact on index 0 mobile
            if(window.matchMedia('(max-width:800px)').matches) {
                let tl = new TimelineLite();
                  tl.to(this.contact, .2, {visibility:'visible', ease:Circ.easeInOut}) //REAPPEAR CONTACT
                    .to(this.contact, 1, {opacity:0.7, ease:Circ.easeInOut}, '-=0.2') // REAPPEAR CONTACT 
                    .addPause().pause();
                  tl.play();
            }   
        } else {
            if(document.querySelector('.mobile-intro-container')) {
                this.textContainer.classList.remove('mobile-intro-container');
                this.fontMesh.material.opacity = 0;
                //TweenMax.to(this.fontMesh.material,.5, { opacity: 0, ease:Circ.easeInOut})// Remove fontMesh
            }
            this.animateInfoProject(index);

            //Remove contact on scroll mobile
            if(window.matchMedia('(max-width:800px)').matches) {
                let tl = new TimelineLite();
                tl.to(this.contact, 1, {opacity:0, ease:Circ.easeInOut}) // DISAPPEAR CONTACT 
                  .to(this.contact, 1, {visibility:'hidden', ease:Circ.easeInOut}) // DISAPPEAR CONTACT
                  .addPause().pause();
                tl.play();
            }  
            
        }
    }

    animateBlockOut() {
        if (this.lastAnimateInIndex === null) return;
        this.lastAnimateInIndex = null;
        TweenMax.to(this.textContainer, .3, { autoAlpha: 0 }, Cubic.easeOut);
    }

    render() {
        //Rotate camera mouse moove
        if(this.rotateCam) {
            this.camera.rotation.x += (this.movementY - this.camera.rotation.x)*0.05;
            this.camera.rotation.y += (this.movementX - this.camera.rotation.y)*0.05;
        } else {
            this.camera.rotation.x += (0 - this.camera.rotation.x)*0.05;
            this.camera.rotation.y += (0 - this.camera.rotation.y)*0.05;
        }

        //Back rock scroll
        if(this.backRockScroll == true) {
            this.backRock.position.y += (this.delta-this.backRock.position.y)*0.04; //Smooth scroll
        }

        //Update Scroll deform
        if(this.inProjectUpdate == true) {
            this.projectDeformContent.loop();
            TweenMax.to(bloomPass, .3, {strength:0.4,threshold: 0.75, ease:Sine.easeOut}).delay(1);
        } 
        
        //Stop update
        if (!this.inProject && !this.inAbout) {
            this.raycast();
            this.updateWall();
        }

        // update lights
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
}