import {TimelineLite} from "gsap";

import Ode from '../assets/img/project/OdeScreen.jpg';
import OdeB from '../assets/img/project/OdeScreenB.jpg';
import OdeC from '../assets/img/project/OdeScreenC.jpg';
import OdeD from '../assets/img/project/OdeScreenD.jpg';
import OdeE from '../assets/img/project/OdeScreenE.jpg';

import RundFromLove from '../assets/img/project/RunFromLoveScreen.jpg';
import RundFromLoveB from '../assets/img/project/RunFromLoveScreenB.jpg';
import RundFromLoveC from '../assets/img/project/RunFromLoveScreenC.jpg';

import Tinnitus from '../assets/img/project/TinnitusScreen.png';
import TinnitusB from '../assets/img/project/TinnitusScreenB.png';
import TinnitusC from '../assets/img/project/TinnitusScreenC.png';

import SabineExp from '../assets/img/project/SabineScreen.jpg';
import SabineExpB from '../assets/img/project/SabineScreenB.jpg';
import SabineExpC from '../assets/img/project/SabineScreenC.jpg';

import DataViz from '../assets/img/project/DataVizScreen.jpg';
import DataVizB from '../assets/img/project/DataVizScreenB.jpg';
import DataVizC from '../assets/img/project/DataVizScreenC.jpg';

const PROJECTS = [
  [Ode,OdeB,OdeC,OdeD,OdeE],
  [RundFromLove,RundFromLoveB,RundFromLoveC],
  [Tinnitus,TinnitusB,TinnitusC],
  [SabineExp,SabineExpB,SabineExpC],
  [DataViz,DataVizB,DataVizC]
]

export default class ProjectDeformContent {

    constructor(scene, index) {

        this.scene = scene;

        this.groupPlaneImg = new THREE.Group();

        this.scrollOffset = 0;
        this.indicatorPosition = 0;

        this.velocityTarget = 0;
        this.velocity = 0;
        this.velocityUniform = { value: 0 };
        this.planes = [];
        
        this.index = index;
        this.lockScroll = false;

        this.currentProject = PROJECTS[this.index];
        this.planeImgNumber = this.currentProject.length;

        //mobile
        this.beginMove = [];
        this.setupMesh();
        this.setupEventListeners();

        //To get out
        this.loop = this.loop.bind(this)
        this.remove = this.remove.bind(this)
        

    }
    
    setupMesh() {
        const backgroundCoverUv = `
        vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
          float screenRatio = screenSize.x / screenSize.y;
          float imageRatio = imageSize.x / imageSize.y;
        
          vec2 newSize = screenRatio < imageRatio 
              ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y)
              : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
        
          vec2 newOffset = (screenRatio < imageRatio 
              ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) 
              : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
        
          return uv * screenSize / newSize + newOffset;
        }
        `
        const vertexShader = `
        precision mediump float;
        
        uniform float uVelo;
        
        varying vec2 vUv;
        
        #define M_PI 3.1415926535897932384626433832795
        
        void main(){
          vec3 pos = position;
          pos.y = pos.y + ((sin(uv.x * M_PI) * uVelo) * 0.125);
        
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
        }
        `
        
        const fragmentShader = `
        precision mediump float;
        
        ${backgroundCoverUv}
        
        uniform sampler2D uTexture;
        
        uniform vec2 uMeshSize;
        uniform vec2 uImageSize;
        
        uniform float uVelo;
        uniform float uScale;
        uniform float uAlpha;
        
        uniform float uTextureLoad;
        
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
        
          vec2 texCenter = vec2(0.5);
          vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
          vec2 texScale = (texUv - texCenter) * uScale + texCenter;
          if(uTextureLoad == 1.){
             vec4 texture = texture2D(uTexture, texScale);
        
          texScale.y += 0.0025 * uVelo;
          if(uv.y < 1.) texture.g = texture2D(uTexture, texScale).g;
        
          texScale.y += 0.0020 * uVelo;
          if(uv.y < 1.) texture.b = texture2D(uTexture, texScale).b;
  

          gl_FragColor = texture;
          gl_FragColor *= uAlpha;
          
          } else {
            gl_FragColor = vec4(0.05,0.05,0.05,1.0);
          }
        }
        `
    
      for(let i=0;i<this.planeImgNumber;i++) {
        let geometry = new THREE.PlaneBufferGeometry(60, 37, 32, 32);
        let material = new THREE.ShaderMaterial({
          transparent: true, 
          fragmentShader,
          vertexShader
        }); 
     
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -80;
        mesh.material.uniforms = {
            uTime: { value: 0 },
            uTexture: { value: 0 },
            uMeshSize: { value: new THREE.Vector2(1.1, 1) },
            uImageSize: { value: new THREE.Vector2(0, 0) },
            uScale: { value: 1. },
            uVelo: this.velocityUniform,
            uAlpha: { value: 0.1 },
            uTextureLoad: { value: 0.}
        }
    
        this.planes.push(mesh);
        const loader = new THREE.TextureLoader()
        this.texture = loader.load(this.currentProject[i], (texture) => {

          texture.minFilter = THREE.LinearFilter
          texture.generateMipmaps = false
          /*var repeatX, repeatY;
          this.texture.wrapS = THREE.ClampToEdgeWrapping;
          this.texture.wrapT = THREE.RepeatWrapping;
          repeatX = 10 * 1080 / (20 * 1144);
          repeatY = 1;
          this.texture.repeat.set(repeatX, repeatY);
          this.texture.offset.x = (repeatX - 1) / 2 * -1;*/
          //scene.getObjectByName('plane'+ i) == planes[i])
          this.planes[i].material.uniforms.uTextureLoad.value = 1.;
          this.planes[i].material.uniforms.uTexture.value = texture;
          //console.log(img.naturalWidth,img.naturalHeight)
          this.planes[i].material.uniforms.uImageSize.value = [1174, 881]; //naturalWidth, naturalHeight
          this.planes[i].position.y = (-60 * i) - 10;
          let rand = Math.random() * (1.3 - 0.7) + 0.7;
          this.planes[i].scale.set(rand,rand,rand)
          i%2 ? this.planes[i].position.x += 3 : this.planes[i].position.x -= 3;

          TweenMax.to(this.planes[i].material.uniforms.uAlpha, 1, {value:1, ease:Circ.easeInOut}).delay(1);

        })
        
        mesh.name = 'plane'+i;
        this.groupPlaneImg.add( mesh );  
      }
      this.scene.add( this.groupPlaneImg ); 
    }


     setupEventListeners() {
        document.addEventListener("wheel", this.scrollDevice.bind(this), false);
        document.addEventListener("DOMMouseScroll", this.scrollDevice.bind(this), false);
        document.addEventListener('touchmove',this.touchMove.bind(this));
      }
      
      touchMove(e) {
          let scrollLimitTop = -2;
          let onScrollLimit = scrollLimitTop + 0.2; // 0.1
          let scrollLimitBot = (this.planes.length-1)*20 + 2;//82 To adjust
        
          if(this.beginMove.length < 1) {
            this.beginMove.push(e.changedTouches["0"].clientY)
          }
          let movement = this.beginMove[0]-e.changedTouches["0"].clientY;
          if(this.scrollOffset >= scrollLimitTop){//Scroll limite
            this.scrollOffset += movement * 0.05;
              if(this.scrollOffset > onScrollLimit && this.scrollOffset <= scrollLimitBot) { //Deform only if not on limit
                this.velocityTarget = movement * 0.5;
              }
          } else {//this.scrollOffset Outside limit
            this.scrollOffset += (onScrollLimit - this.scrollOffset) * 0.5;
          }
          if(this.scrollOffset >= scrollLimitBot){
            this.scrollOffset += (scrollLimitBot - 0.1 - this.scrollOffset) * 0.5;
          }  
        
          setTimeout(()=> {
            this.beginMove = []
          },500)
      }
      
    scrollDevice(e) {
          let isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0
          let scrollLimitTop = -2;
          let onScrollLimit = scrollLimitTop + 0.1;
          let scrollLimitBot = (this.planes.length-1)*20 + 2;//82 To adjust
          let chrome = e.wheelDeltaY;
          let isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
          
          //Scroll & Deformation power
          if(this.scrollOffset >= scrollLimitTop){//Scroll limite
              this.lockScroll = false;
               if(chrome) {
                  if(isTouchPad) {
                    this.scrollOffset += e.deltaY * 0.02;
                  } else { //mouse
                    if(!isMacLike) {// windows
                      this.scrollOffset += e.deltaY * 0.02;
                    } else {
                      this.scrollOffset += e.deltaY * 0.01;
                    }
                  }
                }
                if(!chrome && e.deltaY) {
                  if(isTouchPad) {
                    this.scrollOffset += e.deltaY * 0.02;
                  } else { //mouse
                    if(!isMacLike) {// windows
                      this.scrollOffset += e.deltaY * 0.7;
                    } else {
                      this.scrollOffset += e.deltaY * 0.5;
                    }
                  }
                }
                if(this.scrollOffset > onScrollLimit && this.scrollOffset <= scrollLimitBot) { //Deform only if not on limit
                  if(chrome) {
                    if(isTouchPad) {
                      this.velocityTarget = e.deltaY * 0.6;
                    } else { //mouse
                      if(!isMacLike) {// windows
                        this.velocityTarget = e.deltaY * 0.3;
                      } else {
                        this.velocityTarget = e.deltaY * 0.2;
                      }
                    }
                  }
                  if(!chrome && e.deltaY) {
                    if(isTouchPad) {
                      this.velocityTarget = e.deltaY * 0.6;
                    } else { //mouse
                      if(!isMacLike) {// windows
                        this.velocityTarget = e.deltaY * 6.0;
                      } else {
                        this.velocityTarget = e.deltaY * 5.0;
                      }
                    }
                  }
                }   
              } else {//this.scrollOffset Outside limit
                this.lockScroll = true;
                this.scrollOffset += (onScrollLimit - this.scrollOffset) * 0.1;//0.5
              }
              if(this.scrollOffset >= scrollLimitBot){
                this.lockScroll = true;
                this.scrollOffset += (scrollLimitBot - 0.1 - this.scrollOffset) * 0.5;
              }  
      }

    getLimit() {
      return this.lockScroll;
    }
      
    loop() {
        //this.scrollOffset
        this.indicatorPosition += (this.scrollOffset - this.indicatorPosition)*0.05;
        this.groupPlaneImg.position.y = this.indicatorPosition*3;
        
        // this.velocityTarget => 0
        let lerpValue = .2; // [0, 1] smooth if closest to 0
        let target = 0;
        this.velocityTarget += (target - this.velocityTarget) * lerpValue;
      
        // velocity => this.velocityTarget
        this.velocity += (this.velocityTarget - this.velocity) * .1;
      
        //Uniform value
        this.velocityUniform.value = this.velocity;
      }
      
      remove() {
        for(let i=0;i<this.planeImgNumber;i++) {
            TweenMax.to(this.planes[i].material.uniforms.uAlpha, 1, {value:0, ease:Circ.easeInOut});
        }
          setTimeout(()=>{
            this.scene.remove(this.groupPlaneImg) 
            this.scrollOffset = 0;
            this.indicatorPosition = 0;
            this.velocityTarget = 0;
            this.velocity = 0;
            this.velocityUniform = { value: 0 };
            this.planes = [];
            document.removeEventListener("wheel", this.scrollDevice.bind(this), false);
            document.removeEventListener("DOMMouseScroll", this.scrollDevice.bind(this), false);
            document.removeEventListener('touchmove',this.touchMove.bind(this));
          },2000)
      }
}