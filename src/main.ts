// Import
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

const container = document.getElementById("container")!;

const components = new OBC.Components();

const worlds = components.get(OBC.Worlds);

const world = worlds.create<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBC.SimpleRenderer
>();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();

world.scene.setup();

const grids = components.get(OBC.Grids);
grids.create(world);


// const fragmentManager = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);

await fragmentIfcLoader.setup();

fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;


const file = await fetch(
  "/sample.ifc",
);
const data = await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model = await fragmentIfcLoader.load(buffer);
world.scene.three.add(model);

// const fragmentMap =  model.getFragmentMap([1225]);
// const fragments = model.keyFragments

// console.log(fragmentMap)
// console.log(Object.keys(fragmentMap))
// console.log([...Object.values(fragmentMap)[0]][0]);     // expressID
// console.log(fragments);

// fragmentManager.onFragmentsLoaded.add((model) => {
//   console.log(model);
//   // console.log("Semua ID Properti:", model.getAllPropertiesIDs());
//   // console.log("Semua ID Properti:", model.getProperties(1225));
// });

const highlighter = components.get(OBCF.Highlighter);
highlighter.setup({ world });

// fungsi highlight by expressid
function highlightByExpressID(expressID) {
  const fragmap = model.getFragmentMap([expressID])
  highlighter.highlightByID("select", fragmap);  
}

// ambil property dari highlighter
highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
  // console.log(fragmentIdMap);
  const expressID = [...Object.values(fragmentIdMap)[0]][0]
  const prop = await model.getProperties(expressID)
  console.log(prop)
});


highlightByExpressID(1225);
