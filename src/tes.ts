import * as THREE from "three";
import * as BUI from "@thatopen/ui";
// import Stats from "stats.js";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUIC from "@thatopen/ui-obc";

BUI.Manager.init();


const container = document.getElementById("container")!;

const viewport = document.createElement("bim-viewport");

const components = new OBC.Components();


const worlds = components.get(OBC.Worlds);

const world = worlds.create<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBCF.PostproductionRenderer
>();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBCF.PostproductionRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();

world.renderer.postproduction.enabled = true;

world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

world.scene.setup();

const grids = components.get(OBC.Grids);
const grid = grids.create(world);
world.renderer.postproduction.customEffects.excludedMeshes.push(grid.three);

const fragments = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);

await fragmentIfcLoader.setup();

fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

const propertiesManager = new OBC.IfcPropertiesManager(components);

// const ifcAPI = new IfcAPI();
// ifcAPI.Init();

const file = await fetch("/sample.ifc");
const data = await file.arrayBuffer();  
const buffer = new Uint8Array(data);
const model = await fragmentIfcLoader.load(buffer);
world.scene.three.add(model);
// console.log(model);

const indexer = components.get(OBC.IfcRelationsIndexer)
await indexer.process(model)

const [propertiesTable, updatePropertiesTable] = BUIC.tables.elementProperties({
  components,
  fragmentIdMap: {},
});

propertiesTable.preserveStructureOnFilter = true;
propertiesTable.indentationInText = false;
// const modelID = ifcAPI.OpenModel(buffer);
// const expressID = 1225;
// const itemProps = ifcAPI.GetLine(modelID, expressID);
// console.log(itemProps);

// async function loadIfc() {
//   try {
//     const file = await fetch("/sample.ifc");

//     if (!file.ok) {
//       throw new Error(`Gagal mengambil file: ${file.statusText}`);
//     }

//     console.log("File IFC berhasil diambil:", file);

//     const data = await file.arrayBuffer();
//     console.log("Data IFC (ArrayBuffer):", data);

//     const buffer = new Uint8Array(data);
//     console.log("Buffer IFC:", buffer);

//     console.log("Memulai proses loading model...");
//     const model = await fragmentIfcLoader.load(buffer);
//     console.log("Model IFC berhasil dimuat:", model);

//     model.name = "example";
//     world.scene.three.add(model);
//     console.log("Model ditambahkan ke scene.");

//   } catch (error) {
//     console.error("Error saat memuat IFC:", error);
//   }
// }


// fragments.onFragmentsLoaded.add((model) => {
//   console.log(model);
// });

// BUI.Manager.init();

// loadIfc();

const highlighter = components.get(OBCF.Highlighter);
highlighter.setup({ world });
highlighter.zoomToSelection = true;

const outliner = components.get(OBCF.Outliner);
outliner.world = world;
outliner.enabled = true;

outliner.create(
  "example",
  new THREE.MeshBasicMaterial({
    color: 0xbcf124,
    transparent: true,
    opacity: 0.5,
  }),
);

highlighter.events.select.onHighlight.add((fragmentIdMap) => {
  updatePropertiesTable({fragmentIdMap});
});


highlighter.events.select.onClear.add(() => {
  updatePropertiesTable({fragmentIdMap: {}})
});

const propertiesPanel = BUI.Component.create(() => {
  const onTextInput = (e: Event) => {
    const input = e.target as BUI.TextInput;
    propertiesTable.queryString = input.value !== "" ? input.value : null;
  };

  const expandTable = (e: Event) => {
    const button = e.target as BUI.Button;
    propertiesTable.expanded = !propertiesTable.expanded;
    button.label = propertiesTable.expanded ? "Collapse" : "Expand";
  };

  const copyAsTSV = async () => {
    await navigator.clipboard.writeText(propertiesTable.tsv);
  };

  return BUI.html`
    <bim-panel label="Properties">
      <bim-panel-section label="Element Data">
        <div style="display: flex; gap: 0.5rem;">
          <bim-button @click=${expandTable} label=${propertiesTable.expanded ? "Collapse" : "Expand"}></bim-button> 
          <bim-button @click=${copyAsTSV} label="Copy as TSV"></bim-button> 
        </div> 
        <bim-text-input @input=${onTextInput} placeholder="Search Property" debounce="250"></bim-text-input>
        ${propertiesTable}
      </bim-panel-section>
    </bim-panel>
  `;
});

const app = document.createElement("bim-grid");
app.layouts = {
  main: {
    template: `
    "propertiesPanel viewport"
    /25rem 1fr
    `,
    elements: { propertiesPanel, viewport },
  },
};

app.layout = "main";
document.body.append(app);


// async function highlightByExpressID(model, expressID) {
//   const modelIdMap = fragments.getModelIdMap(model);
//   let fragmentIdMap = {};

//   for (const fragmentID in modelIdMap) {
//       const expressIDs = modelIdMap[fragmentID];
//       if (expressIDs.has(expressID)) {
//           fragmentIdMap[fragmentID] = new Set([expressID]);
//           break;
//       }
//   }

//   if (Object.keys(fragmentIdMap).length > 0) {
//       await highlighter.highlightByID("highlightSelection", fragmentIdMap, true, true);
//   } else {
//       console.warn("ExpressID tidak ditemukan.");
//   }
// }

// highlightByExpressID(model, 1225)
// console.log("Model Properties:", propertiesManager);
// const hist = await propertiesManager.getEntityRef(model, 1)
// console.log(hist)
