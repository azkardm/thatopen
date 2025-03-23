// Import
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as THREE from "three";

const container = document.getElementById("container")!;
const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);
const world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBCF.RendererWith2D>();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBCF.RendererWith2D(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();
world.scene.setup();

const grids = components.get(OBC.Grids);
grids.create(world);

const fragmentIfcLoader = components.get(OBC.IfcLoader);
await fragmentIfcLoader.setup();
fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

const file = await fetch("/sample.ifc");
const data = await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model = await fragmentIfcLoader.load(buffer);
world.scene.three.add(model);

const measurements = components.get(OBC.MeasurementUtils);
const highlighter = components.get(OBCF.Highlighter);
const marker = components.get(OBCF.Marker);
marker.threshold = 5;
highlighter.setup({ world });

// Fungsi highlight by expressID
function highlightByExpressID(expressID, x, y, z, targetx, targety, targetz) {
    world.camera.controls.setLookAt(x, y, z, targetx, targety, targetz);
    console.log(world.camera.three.position);

    const fragmap = model.getFragmentMap([expressID]);
    highlighter.highlightByID("select", fragmap);
}

highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
  console.log(fragmentIdMap);
  const expressID = [...Object.values(fragmentIdMap)[0]][0];
  const prop = await model.getProperties(expressID);
  console.log(prop);
  const volume = measurements.getVolumeFromFragments(fragmentIdMap);
  console.log("volume:", volume);
  console.log(world.camera.three.position);
  const target = new THREE.Vector3()
  console.log(world.camera.controls.getTarget(target));  
});

function setupCameraLock(world, lockKey = "l") {
  const camera = world.camera; // Mengakses kamera dari world
  let isLocked = false; // Status awal kamera
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  // ====== Fungsi Event Listener ======
  function onMouseClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, world.camera.three);
      const intersects = raycaster.intersectObjects(world.scene.three.children);

      if (intersects.length > 0) {
          const clickedPoint = intersects[0].point.clone();
          console.log(clickedPoint)
          const x = clickedPoint.x
          const y = clickedPoint.y
          const z = clickedPoint.z
          marker.create(world, "🚀", new THREE.Vector3(x, y, z));
      }
  }

  document.addEventListener("keydown", function(event) {
      if (event.key.toLowerCase() === lockKey.toLowerCase()) { 
          isLocked = !isLocked; // Toggle lock/unlock
          camera.controls.enabled = !isLocked; // Lock/unlock kamera
          console.log(`Camera ${isLocked ? "locked" : "unlocked"}`);

          if (isLocked) {
              highlighter.enabled = false;
              highlighter.clear();
              // console.log("Camera locked");

              // Aktifkan event listener untuk mouse click
              window.addEventListener("click", onMouseClick);
          } else {
              highlighter.enabled = true;
              // console.log("Camera unlocked");

              // Hapus event listener agar tidak aktif saat kamera tidak dikunci
              window.removeEventListener("click", onMouseClick);
          }
      }
  });
}


// Jalankan fitur
// highlightByExpressID(1225, 50, 50, 50, 0, 0, 0);
setupCameraLock(world);
