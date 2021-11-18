import { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { shapeKeys } from 'common-types';
import model from './facefull.glb';

type GLTFResult = GLTF & {
  nodes: {
    EyeLeft: THREE.SkinnedMesh;
    EyeRight: THREE.SkinnedMesh;
    Wolf3D_Head: THREE.SkinnedMesh;
    Wolf3D_Hair: THREE.SkinnedMesh;
    Wolf3D_Shirt: THREE.SkinnedMesh;
    Wolf3D_Teeth: THREE.SkinnedMesh;
    Hips: THREE.Bone;
  };
  materials: {
    Wolf3D_Eye: THREE.MeshStandardMaterial;
    Wolf3D_Skin: THREE.MeshStandardMaterial;
    Wolf3D_Hair: THREE.MeshStandardMaterial;
    Wolf3D_Shirt: THREE.MeshStandardMaterial;
    Wolf3D_Teeth: THREE.MeshStandardMaterial;
  };
};

export function Model({ blendShapes }: { blendShapes: number[] }) {
  const group = useRef<THREE.Group>();
  const { nodes, materials } = useGLTF(model) as unknown as GLTFResult;
  const [pointerFocus, setPointerFocus] = useState<boolean>(false);
  const [rotation, setRotation] = useState<
    [x: number, y: number, z: number, order?: string]
  >([0, 0, 0]);

  const dict = useMemo(() => {
    return {
      head: Object.keys(nodes.Wolf3D_Head.morphTargetDictionary).reduce<{
        [key: string]: number;
      }>(
        (out, curr) => ({
          ...out,
          [curr.toLowerCase()]: nodes.Wolf3D_Head.morphTargetDictionary[curr],
        }),
        {}
      ),
      teeth: Object.keys(nodes.Wolf3D_Teeth.morphTargetDictionary).reduce<{
        [key: string]: number;
      }>(
        (out, curr) => ({
          ...out,
          [curr.toLowerCase()]: nodes.Wolf3D_Teeth.morphTargetDictionary[curr],
        }),
        {}
      ),
    };
  }, []);

  useEffect(() => {
    blendShapes.forEach((value, index) => {
      const headkey = dict.head[shapeKeys[index].toLowerCase()];
      if (headkey) nodes.Wolf3D_Head.morphTargetInfluences[headkey] = value;
      const teethkey = dict.teeth[shapeKeys[index].toLowerCase()];
      if (teethkey) nodes.Wolf3D_Teeth.morphTargetInfluences[teethkey] = value;
    });
  }, [blendShapes]);

  const pointerMove = (event) => {
    if (pointerFocus) {
      setRotation(([x, y, z, order]) => [
        x,
        y + event.movementX * 0.01,
        z,
        order,
      ]);
    }
  };

  return (
    <group
      ref={group}
      dispose={null}
      onPointerDown={() => setPointerFocus(true)}
      onPointerUp={() => setPointerFocus(false)}
      onPointerMove={pointerMove}
      rotation={rotation}
    >
      <group position={[0, 0, -0.07]}>
        <primitive object={nodes.Hips} />
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={nodes.EyeLeft.material}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={nodes.EyeRight.material}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
        <skinnedMesh
          name="Wolf3D_Head"
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Shirt.geometry}
          material={materials.Wolf3D_Shirt}
          skeleton={nodes.Wolf3D_Shirt.skeleton}
        />
        <skinnedMesh
          name="Wolf3D_Teeth"
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
      </group>
    </group>
  );
}

useGLTF.preload(model);
