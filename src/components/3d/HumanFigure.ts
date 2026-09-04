import * as THREE from 'three';

// Generador de escala humana arquitectónica (1.75m estándar de referencia Le Corbusier / Modulor)
export function createHumanFigure(height: number = 1.75, color: number = 0xd93829): THREE.Group {
  const group = new THREE.Group();
  group.name = 'human_figure';

  const material = new THREE.MeshLambertMaterial({
    color: color,
  });

  const legH = height * 0.45;
  const legR = 0.035;
  const torsoH = height * 0.35;
  const headR = height * 0.08;

  // Pierna Izquierda
  const legLGeo = new THREE.CylinderGeometry(legR, legR * 0.8, legH, 8);
  const legL = new THREE.Mesh(legLGeo, material);
  legL.position.set(-0.06, legH / 2, 0);
  legL.castShadow = true;
  group.add(legL);

  // Pierna Derecha
  const legRGeo = new THREE.CylinderGeometry(legR, legR * 0.8, legH, 8);
  const legRMesh = new THREE.Mesh(legRGeo, material);
  legRMesh.position.set(0.06, legH / 2, 0);
  legRMesh.castShadow = true;
  group.add(legRMesh);

  // Torso / Cuerpo
  const torsoGeo = new THREE.BoxGeometry(0.24, torsoH, 0.14);
  const torso = new THREE.Mesh(torsoGeo, material);
  torso.position.set(0, legH + torsoH / 2, 0);
  torso.castShadow = true;
  group.add(torso);

  // Cabeza
  const headGeo = new THREE.SphereGeometry(headR, 12, 10);
  const head = new THREE.Mesh(headGeo, material);
  head.position.set(0, legH + torsoH + headR * 0.9, 0);
  head.castShadow = true;
  group.add(head);

  // Brazos
  const armH = torsoH * 0.85;
  const armR = 0.025;

  const armLGeo = new THREE.CylinderGeometry(armR, armR * 0.8, armH, 8);
  const armL = new THREE.Mesh(armLGeo, material);
  armL.position.set(-0.16, legH + torsoH * 0.6, 0);
  armL.castShadow = true;
  group.add(armL);

  const armRGeo = new THREE.CylinderGeometry(armR, armR * 0.8, armH, 8);
  const armRMesh = new THREE.Mesh(armRGeo, material);
  armRMesh.position.set(0.16, legH + torsoH * 0.6, 0);
  armRMesh.castShadow = true;
  group.add(armRMesh);

  return group;
}
