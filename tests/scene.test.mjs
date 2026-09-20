import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneFrame,aperture} from '../assets/scene.mjs';
const viewports=[[1440,900],[1920,1080],[1024,768],[390,844],[320,568],[844,390]];
test('the initial live screen matches the measured monitor aperture at every aspect ratio',()=>{
  for(const [w,h] of viewports){
    const f=sceneFrame(0,w,h);
    assert.equal(f.scale,1);
    assert.ok(Math.abs(f.shell.x-(f.imageX+f.imageWidth*aperture.x))<1e-8);
    assert.ok(Math.abs(f.shell.y-(f.imageY+f.imageHeight*aperture.y))<1e-8);
    assert.equal(f.shell.width,f.imageWidth*aperture.width);
    assert.equal(f.desktop,0);assert.equal(f.hero,1);assert.equal(f.ready,false);
  }
});
test('arrival is a crisp, fully visible desktop with finite geometry through the journey',()=>{
  for(const [w,h] of viewports){
    let previous=0;
    for(let i=0;i<=100;i++){
      const f=sceneFrame(i/100,w,h);
      assert.ok(f.scale>=previous);previous=f.scale;
      for(const v of [...Object.values(f.shell),f.scale,f.imageX,f.imageY])assert.ok(Number.isFinite(v));
      assert.ok(f.shell.width>0&&f.shell.height>0);
    }
    const f=sceneFrame(1,w,h);
    for(const key of Object.keys(f.final))assert.ok(Math.abs(f.shell[key]-f.final[key])<1e-8);
    assert.ok(f.shell.x>=0&&f.shell.x+f.shell.width<=w);
    assert.ok(f.shell.y>=0&&f.shell.y+f.shell.height<=h);
    assert.equal(f.ready,true);assert.equal(f.desktop,1);assert.equal(f.scenery,0);assert.equal(f.hero,0);
  }
});
test('reduced motion never zooms and gives direct access to the same desktop',()=>{
  for(const [w,h] of viewports){
    for(const p of [0,.1,.3,.49,.5,.8,1])assert.equal(sceneFrame(p,w,h,true).scale,1);
    assert.equal(sceneFrame(.49,w,h,true).desktop,0);
    assert.deepEqual(sceneFrame(.49,w,h,true).shell,sceneFrame(0,w,h,true).shell);
    const f=sceneFrame(.5,w,h,true);assert.equal(f.desktop,1);assert.equal(f.ready,true);for(const key of Object.keys(f.final))assert.ok(Math.abs(f.shell[key]-f.final[key])<1e-8);
    assert.deepEqual(sceneFrame(9,w,h),sceneFrame(1,w,h));
    assert.deepEqual(sceneFrame(-9,w,h),sceneFrame(0,w,h));
  }
});
