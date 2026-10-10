import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Rotate3D, Split, RefreshCw, Info } from "lucide-react";

const parts = {
  DNA: { color: "#4f79d8", info: "DNA contains the gene whose base sequence provides the instructions for making a protein." },
  "DNA base pairs": { color: "#78a7c5", info: "The bases pair in a specific way: A with T, and C with G. Their sequence stores genetic information." },
  "RNA polymerase": { color: "#f6a43a", info: "RNA polymerase reads the DNA template strand and builds a complementary mRNA molecule." },
  mRNA: { color: "#e74c64", info: "Messenger RNA carries a copied genetic message from DNA to a ribosome for translation." },
  "Small ribosomal subunit": { color: "#67b7a5", info: "The small ribosomal subunit binds mRNA and helps read its codons." },
  "Large ribosomal subunit": { color: "#278c7d", info: "The large ribosomal subunit helps join amino acids together with peptide bonds." },
  tRNA: { color: "#9a68c7", info: "Transfer RNA carries a specific amino acid and uses its anticodon to recognise a complementary mRNA codon." },
  Anticodon: { color: "#6b3fa0", info: "An anticodon is a three-base tRNA sequence complementary to an mRNA codon." },
  Codon: { color: "#c83d55", info: "A codon is a three-base mRNA sequence that specifies an amino acid or a start/stop signal." },
  "Amino acid": { color: "#e9c34f", info: "Amino acids are small molecules linked together to form a polypeptide." },
  "Polypeptide chain": { color: "#da7e37", info: "The polypeptide is the growing chain of amino acids produced during translation." },
  Nucleus: { color: "#9db7d7", info: "In eukaryotic cells, transcription occurs in the nucleus before mRNA travels to the cytoplasm." },
  "Nuclear membrane": { color: "#6e8eb5", info: "The nuclear envelope separates the nucleus from the cytoplasm and contains pores through which mRNA can leave." },
};

function Pick({ name, children, select }) {
  return <group onClick={(event) => { event.stopPropagation(); select(name); }}>{children}</group>;
}

function Strand({ points, color, radius = 0.045 }) {
  const curve = new THREE.CatmullRomCurve3(points);
  return <mesh><tubeGeometry args={[curve, 96, radius, 10, false]} /><meshStandardMaterial color={color} roughness={0.48} /></mesh>;
}

function DNA({ select }) {
  const axisX = -1.45;
  const railPoints = [-1, 1].map((side) => Array.from({ length: 45 }, (_, index) => {
    const y = -1.5 + index * (3 / 44);
    const angle = index * 0.22;
    return new THREE.Vector3(axisX + side * 0.31 * Math.cos(angle), y, side * 0.31 * Math.sin(angle));
  }));

  return <group>
    <Pick name="DNA" select={select}>
      <group>
        {railPoints.map((points, index) => <Strand key={index} points={points} color={index ? "#4775c8" : "#79a5ed"} radius={0.065} />)}
        <Text position={[axisX, -1.82, 0]} fontSize={0.16} color="#294763">DNA double helix</Text>
      </group>
    </Pick>
    <Pick name="DNA base pairs" select={select}>
      <group>{Array.from({ length: 12 }, (_, index) => {
        const y = -1.34 + index * 0.245;
        const angle = index * 0.54;
        return <group key={index} position={[axisX, y, 0]} rotation={[0, -angle, 0]}>
          <mesh position={[-0.105, 0, 0]}><boxGeometry args={[0.23, 0.045, 0.08]} /><meshStandardMaterial color={index % 2 ? "#55a5b4" : "#a57ac0"} /></mesh>
          <mesh position={[0.105, 0, 0]}><boxGeometry args={[0.23, 0.045, 0.08]} /><meshStandardMaterial color={index % 2 ? "#85c7b4" : "#e2bb5b"} /></mesh>
        </group>;
      })}</group>
    </Pick>
  </group>;
}

function Polymerase({ select, explode }) {
  return <Pick name="RNA polymerase" select={select}>
    <group position={[-1.45, 0.05 + explode * 0.45, 0.02]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.49, 0.2, 20, 48]} /><meshStandardMaterial color="#e89b3d" roughness={0.62} /></mesh>
      <mesh position={[-0.3, 0.04, 0.02]} scale={[0.55, 0.56, 0.48]}><sphereGeometry args={[0.58, 32, 24]} /><meshStandardMaterial color="#f4ae53" roughness={0.7} /></mesh>
      <mesh position={[0.3, 0.04, 0.02]} scale={[0.55, 0.56, 0.48]}><sphereGeometry args={[0.58, 32, 24]} /><meshStandardMaterial color="#d98732" roughness={0.7} /></mesh>
    </group>
  </Pick>;
}

function TranscriptionRNA({ select, explode }) {
  const points = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    return new THREE.Vector3(-0.82 + t * 2.65, 0.25 + t * 0.45 + Math.sin(t * 11) * 0.08, 0.54 + Math.sin(t * 8) * 0.06);
  });
  return <group position={[0, -explode * 0.28, 0]}>
    <Pick name="mRNA" select={select}><Strand points={points} color="#d94d65" radius={0.055} /></Pick>
    {points.filter((_, index) => index % 2 === 0).map((point, index) => <mesh key={index} position={point.toArray()}><sphereGeometry args={[0.065, 16, 12]} /><meshStandardMaterial color={index % 2 ? "#ef8190" : "#c83d55"} /></mesh>)}
    <Text position={[1.15, 0.95 - explode * 0.28, 0.5]} fontSize={0.16} color="#8f3047">new mRNA</Text>
  </group>;
}

function TranscriptionScene({ explode, select }) {
  return <>
    <DNA explode={explode} select={select} />
    <Polymerase explode={explode} select={select} />
    <TranscriptionRNA explode={explode} select={select} />
  </>;
}

function Ribosome({ explode, select }) {
  return <group position={[0, 0, 0]}>
    <Pick name="Large ribosomal subunit" select={select}>
      <group position={[0, 0.46 + explode * 0.35, 0]}>
        <mesh scale={[1.02, 0.62, 0.66]}><sphereGeometry args={[0.72, 40, 28]} /><meshStandardMaterial color="#278c7d" roughness={0.66} /></mesh>
        <mesh position={[-0.56, -0.2, 0.02]} scale={[0.48, 0.35, 0.58]}><sphereGeometry args={[0.64, 32, 24]} /><meshStandardMaterial color="#329988" roughness={0.7} /></mesh>
        <mesh position={[0.56, -0.2, 0.02]} scale={[0.48, 0.35, 0.58]}><sphereGeometry args={[0.64, 32, 24]} /><meshStandardMaterial color="#23796f" roughness={0.7} /></mesh>
      </group>
    </Pick>
    <Pick name="Small ribosomal subunit" select={select}>
      <group position={[0, -0.65 - explode * 0.35, 0]}>
        <mesh scale={[0.92, 0.36, 0.58]}><sphereGeometry args={[0.68, 40, 24]} /><meshStandardMaterial color="#67b7a5" roughness={0.68} /></mesh>
        <mesh position={[0.35, 0.12, 0.03]} scale={[0.52, 0.3, 0.54]}><sphereGeometry args={[0.58, 32, 24]} /><meshStandardMaterial color="#78c4b2" roughness={0.7} /></mesh>
      </group>
    </Pick>
  </group>;
}

function TranslationRNA({ select }) {
  const points = Array.from({ length: 31 }, (_, index) => {
    const x = -2.05 + index * 0.137;
    return new THREE.Vector3(x, -0.17, 0.03 + Math.sin(index * 0.48) * 0.035);
  });
  return <group>
    <Pick name="mRNA" select={select}><Strand points={points} color="#d94d65" radius={0.06} /></Pick>
    {Array.from({ length: 15 }, (_, index) => {
      const x = -1.9 + index * 0.275;
      const isCodon = index >= 7 && index <= 9;
      return <mesh key={index} position={[x, -0.1, 0.06]}><sphereGeometry args={[isCodon ? 0.073 : 0.05, 16, 12]} /><meshStandardMaterial color={isCodon ? "#bb384e" : "#ef8190"} /></mesh>;
    })}
    <Pick name="Codon" select={select}>
      <group position={[0.14, -0.055, 0.13]}>
        {[-0.12, 0, 0.12].map((x, index) => <mesh key={index} position={[x, 0, 0]}><boxGeometry args={[0.08, 0.13, 0.07]} /><meshStandardMaterial color="#c83d55" /></mesh>)}
      </group>
    </Pick>
  </group>;
}

function TRNA({ x, y = 0.22, z = 0.56, paired = false, select }) {
  const color = paired ? "#9a68c7" : "#8560ae";
  const paths = [
    [[0, -0.4, 0], [0, -0.15, 0], [0, 0.12, 0], [0, 0.34, 0]],
    [[0, 0.28, 0], [-0.16, 0.43, 0], [-0.32, 0.52, 0], [-0.38, 0.68, 0]],
    [[0, 0.28, 0], [0.16, 0.43, 0], [0.32, 0.52, 0], [0.38, 0.68, 0]],
  ].map((path) => path.map(([px, py, pz]) => new THREE.Vector3(px, py, pz)));

  return <group position={[x, y, z]}>
    <Pick name="tRNA" select={select}>
      <group>{paths.map((points, index) => <Strand key={index} points={points} color={color} radius={0.055} />)}</group>
    </Pick>
    <Pick name="Anticodon" select={select}>
      <group>{[-0.12, 0, 0.12].map((offset, index) => <mesh key={index} position={[offset, -0.39, 0]}><boxGeometry args={[0.075, 0.085, 0.075]} /><meshStandardMaterial color={paired ? "#6b3fa0" : "#8057a7"} /></mesh>)}</group>
    </Pick>
    <Pick name="Amino acid" select={select}>
      <mesh position={[-0.38, 0.71, 0]}><sphereGeometry args={[0.13, 24, 20]} /><meshStandardMaterial color="#e9c34f" roughness={0.45} /></mesh>
    </Pick>
  </group>;
}

function Peptide({ explode, select }) {
  const residues = [[-0.74, 1.34], [-0.54, 1.5], [-0.32, 1.54], [-0.12, 1.42], [0.06, 1.2]];
  const points = residues.map(([x, y]) => new THREE.Vector3(x, y + explode * 0.25, 0.6));
  return <Pick name="Polypeptide chain" select={select}>
    <group>
      <Strand points={points} color="#da7e37" radius={0.045} />
      {residues.map(([x, y], index) => <Pick key={index} name="Amino acid" select={select}>
        <mesh position={[x, y + explode * 0.25, 0.6]}><sphereGeometry args={[0.105, 20, 16]} /><meshStandardMaterial color={index % 2 ? "#e9a648" : "#da7e37"} /></mesh>
      </Pick>)}
      <Text position={[-0.44, 1.8 + explode * 0.25, 0.6]} fontSize={0.15} color="#955021">growing polypeptide</Text>
    </group>
  </Pick>;
}

function TranslationScene({ explode, select }) {
  return <>
    <TranslationRNA select={select} />
    <Ribosome explode={explode} select={select} />
    <TRNA x={0.14} z={0.17} paired select={select} />
    <TRNA x={1.16} y={0.46} z={0.6} select={select} />
    <Peptide explode={explode} select={select} />
  </>;
}

function Scene({ explode, select, stage }) {
  return <>
    <ambientLight intensity={1.25} />
    <directionalLight position={[4, 6, 5]} intensity={2} />
    <directionalLight position={[-5, -2, -4]} intensity={0.6} />
    {stage === "Transcription" ? <TranscriptionScene explode={explode} select={select} /> : <TranslationScene explode={explode} select={select} />}
    <OrbitControls makeDefault enablePan={false} minDistance={3.2} maxDistance={8} />
  </>;
}

export default function App(){
 const [selected,setSelected]=useState("DNA"); const [explode,setExplode]=useState(0); const [stage,setStage]=useState("Translation");
 const reset=()=>{setExplode(0);setSelected("DNA")};
 return <div className="min-h-screen bg-[#edf3f0] text-slate-800 font-sans flex flex-col">
  <header className="px-4 md:px-8 py-4 bg-[#193b43] text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
   <div><div className="text-xs uppercase tracking-[.22em] text-teal-200">Year 10 Biology • Interactive Lab</div><h1 className="text-xl md:text-3xl font-semibold">Protein Synthesis in 3D</h1></div>
   <div className="flex gap-2"><button onClick={reset} className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 flex gap-2 items-center"><RefreshCw size={16}/> Reset</button></div>
  </header>
  <main className="flex-1 grid lg:grid-cols-[1fr_340px] gap-4 p-3 md:p-5 max-w-[1500px] w-full mx-auto">
   <section className="bg-[#f8faf8] rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col min-h-[62vh]">
    <div className="px-4 py-3 border-b flex flex-wrap gap-2 items-center justify-between bg-white">
     <div className="flex gap-2"><button onClick={()=>setStage("Transcription")} className={`px-3 py-1.5 rounded-full text-sm ${stage==="Transcription"?"bg-[#193b43] text-white":"bg-slate-100"}`}>1. Transcription</button><button onClick={()=>setStage("Translation")} className={`px-3 py-1.5 rounded-full text-sm ${stage==="Translation"?"bg-[#193b43] text-white":"bg-slate-100"}`}>2. Translation</button></div>
     <span className="text-sm text-slate-500 flex items-center gap-1"><Rotate3D size={16}/> Drag to rotate • pinch/scroll to zoom</span>
    </div>
    <div className="relative flex-1 min-h-[480px] bg-gradient-to-b from-[#eef7f4] to-[#e6edef]">
      <Canvas camera={{position:[0,0.3,6.6],fov:43}} onPointerMissed={()=>setSelected(null)}><Scene explode={explode} select={setSelected} stage={stage}/></Canvas>
      <div className="absolute left-3 bottom-3 bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-xs shadow border"><b>{stage}</b><br/>{stage==="Transcription"?"DNA → RNA polymerase → mRNA":"mRNA → ribosome → tRNA → amino acid → polypeptide"}</div>
    </div>
    <div className="p-4 bg-white border-t"><div className="flex justify-between text-sm mb-2"><span className="font-medium flex gap-2"><Split size={17}/> Pull apart</span><span>{Math.round(explode*100)}%</span></div><input aria-label="Exploded view" className="w-full accent-[#287f76]" type="range" min="0" max="1" step=".01" value={explode} onChange={e=>setExplode(+e.target.value)}/></div>
   </section>
   <aside className="space-y-4">
    <div className="bg-white rounded-2xl shadow-md border p-5"><div className="flex items-center gap-2 text-[#287f76] text-sm font-semibold uppercase tracking-wider"><Info size={17}/> Selected structure</div>{selected?<><div className="flex items-center gap-3 mt-4"><span className="w-4 h-4 rounded-full" style={{background:parts[selected]?.color}}/><h2 className="text-2xl font-semibold">{selected}</h2></div><p className="mt-3 leading-relaxed text-slate-600">{parts[selected]?.info}</p></>:<p className="mt-3 text-slate-500">Tap any coloured structure to identify it.</p>}</div>
    <div className="bg-white rounded-2xl shadow-md border p-5"><h3 className="font-semibold mb-3">Structure key</h3><div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-1">{Object.keys(parts).filter(x=>!["Nucleus","Nuclear membrane"].includes(x)).map(name=><button key={name} onClick={()=>setSelected(name)} className="flex items-center gap-3 text-left hover:bg-slate-50 rounded-lg p-2 text-sm"><span className="w-3 h-3 rounded-full shrink-0" style={{background:parts[name].color}}/>{name}</button>)}</div></div>
    <div className="rounded-2xl bg-[#173d45] text-white p-5"><h3 className="font-semibold">How to explore</h3><ol className="text-sm mt-2 space-y-1 text-teal-50"><li>1. Drag the model to rotate it.</li><li>2. Tap a structure to identify it.</li><li>3. Move the slider to explode the model.</li><li>4. Compare transcription with translation.</li></ol></div>
   </aside>
  </main>
 </div>
}