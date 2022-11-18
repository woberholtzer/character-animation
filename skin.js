// An example class you could use to encapsulate a joint
// (feel free to modify this)
class Joint {
  /**
   * @param {string} name Name of this joint
   * @param {vec3} pos Position of this joint
   */
  constructor(name, pos) {
    this.name = name;
    this.pos = glMatrix.vec3.clone(pos);
    this.leaf = false;
    this.parent = null;
    this.children = [];
  }
}

class Bone {

  getBoneAvg(){
    return [0.5*(this.joint1.pos[0]+this.joint2.pos[0]), 
    0.5*(this.joint1.pos[1]+this.joint2.pos[1]),
    0.5*(this.joint1.pos[2]+this.joint2.pos[2])];
  }
  
  constructor(joint1, joint2){
    this.joint1 = joint1;
    this.joint2 = joint2;
    this.c = this.getBoneAvg();
  }
}

class Animation {
  constructor(mesh, skeleton) { // TODO: Add parameters
      this.mesh = mesh;
      this.skeleton = skeleton;
      this.startTime = (new Date()).getTime();
      // TODO: Add more stuff
  }
   
  animate() {
    let skeleton = this.skeleton;
    let thisTime = (new Date()).getTime();
    let t = (thisTime - this.startTime)/1000.0; // Change in time in seconds

    // TODO: Fill this in

    let move = 0.1*(1 + Math.cos(t));
    let move1 = 0.02*(1 + Math.cos(t));

    let chain = getChain(skeleton, "Left_Forearm");
    let end = glMatrix.vec3.fromValues(skeleton.Left_Forearm.pos[0], 
      move, skeleton.Left_Forearm.pos[2]);

    let chain1 = getChain(skeleton, "Head");
    let end1 = glMatrix.vec3.fromValues(move1, skeleton.Head.pos[1], 
      skeleton.Head.pos[2]);
    
    
    chain = fabrik(chain, end);
    chain1 = fabrik(chain1, end1);
    updatePos(skeleton, chain);
    updatePos(skeleton, chain1);

    skeleton.bones = [];
    skeleton.bones.name = "Bones";

    bonesRec(skeleton, "Root", skeleton.bones, [0,1,0]);
    matrices = getMatrixList(skeleton.bones);

    this.mesh.updateBoneTransforms(matrices);

    this.mesh.render(this.mesh.canvas);
    requestAnimationFrame(this.animate.bind(this));
  }
}

/**
 * Return a list of the vertex coordinates in a mesh
 * @param {SkinMesh} mesh The mesh
 * @returns List of vec3: Mesh vertices
 */
function getMeshVertices(mesh) {
  let X = [];
  for (let i = 0; i < mesh.vertices.length; i++) {
      X.push(glMatrix.vec3.clone(mesh.vertices[i].pos));
  }
  return X;
}

function projVector(u, v) {
vec3 = glMatrix.vec3.create();
let len = (glMatrix.vec3.dot(u, v)/glMatrix.vec3.dot(v, v));
v1 = glMatrix.vec3.clone(v);
vec3 = glMatrix.vec3.scale(vec3, v1, len);
return vec3;
}

function projPerpVector(u, v) {
  vec3 = glMatrix.vec3.create();
  u1 = glMatrix.vec3.clone(u);
  vec3 = glMatrix.vec3.subtract(vec3, u1, projVector(u, v));
  return vec3;
  }

function projPerpVectorNormalized(u, v) {
vec3 = glMatrix.vec3.create();
u1 = glMatrix.vec3.clone(u);
vec3 = glMatrix.vec3.subtract(vec3, u1, projVector(u, v));
glMatrix.vec3.normalize(vec3, vec3);
return vec3;
}

function loopThrough(skeleton){
  for (let joint in skeleton){
    joint = skeleton[joint];
    console.log(joint);
  }
}


function setProperties(skeleton){
  for (let name in skeleton){
    joint = skeleton[name];
    joint.name = name;
  }
  for (let leaf in skeleton){
    joint = skeleton[leaf];
    if (joint.children.length == 0){
      joint.leaf = true;
    } else {
      joint.leaf = false;
    }
  }
  for (let joint in skeleton) {
    joint = skeleton[joint]
    for(let child of joint.children) {
      child = skeleton[child];
      child.parent = joint.name;
    }
  }
}

function getChain(skeleton, joint_name){
  let matches = [];
  let joint = joint_name;
  if (skeleton[joint].leaf = true){
    matches.push(skeleton[joint]);
    joint = skeleton[joint].parent;
    while (skeleton[joint].children.length == 1){
      matches.push(skeleton[joint]);
      joint = skeleton[joint].parent;
    }
  }
  matches.push(skeleton[joint]);
  return matches;
}

function updatePos(skeleton, chain){
  for (let joint in chain){
    let name = chain[joint].name;
    skeleton[name].pos = chain[joint].pos
  }
}

function fabrik(chain, target){
  let chain_rev = [];
  let chain_clone = JSON.parse(JSON.stringify(chain));
  for (let i = chain.length-1; i >= 0; i--){
    chain_rev.push(chain[i]);
  }

  for (let i = 0; i < chain.length; i++){
    if (i == 0){
      chain_clone[i].pos = target;
    } else {
      u = glMatrix.vec3.create();
      glMatrix.vec3.subtract(u, chain_clone[i].pos, chain_clone[i-1].pos);
      glMatrix.vec3.normalize(u, u);

      subt = glMatrix.vec3.create();
      glMatrix.vec3.subtract(subt, chain[i-1].pos, chain[i].pos);
    
    
      glMatrix.vec3.scaleAndAdd(chain_clone[i].pos, chain_clone[i-1].pos,
        u, glMatrix.vec3.length(subt));

    }
  }

  /******************REVERSE****************************/

  let clone_rev = [];

  for (let i = chain_clone.length-1; i >= 0; i--){
    clone_rev.push(chain_clone[i]);
  }

  chain_rev_clone = JSON.parse(JSON.stringify(clone_rev));

  for (let i = 0; i < chain_rev.length; i++){
    if (i == 0){
      chain_rev_clone[i].pos = chain[chain.length-1].pos;
    } else {
      u = glMatrix.vec3.create();
      glMatrix.vec3.subtract(u, chain_rev_clone[i].pos, chain_rev_clone[i-1].pos);
      glMatrix.vec3.normalize(u, u);

      subt = glMatrix.vec3.create();
      glMatrix.vec3.subtract(subt, chain_rev[i-1].pos, chain_rev[i].pos);

      glMatrix.vec3.scaleAndAdd(chain_rev_clone[i].pos, chain_rev_clone[i-1].pos,
        u, glMatrix.vec3.length(subt));
    }
  }

  let to_return = [];

  for (let i = chain_rev_clone.length-1; i >= 0; i--){
    to_return.push(chain_rev_clone[i]);
  }

  chain = to_return;

  return to_return;
}

function bonesRec(skeleton, joint, bones, wLast){
  let nextjoint = null;

  if (skeleton[joint].children.length == 0){
    return bones;
  }

  for (let child of skeleton[joint].children){
    bone = new Bone(skeleton[joint], skeleton[child]);
    bone.wLast = wLast;

    vecN = glMatrix.vec3.create();
    glMatrix.vec3.subtract(vecN, bone.joint2.pos, bone.joint1.pos);
    glMatrix.vec3.normalize(vecN, vecN);
    bone.w = vecN;

    bone.v = projPerpVectorNormalized(bone.wLast, bone.w);

    u = glMatrix.vec3.create();

    glMatrix.vec3.cross(u, bone.v, bone.w);

    bone.u = u;

    t = glMatrix.mat4.fromValues(
      bone.u[0], bone.u[1], bone.u[2], 0,
      bone.v[0], bone.v[1], bone.v[2], 0,
      bone.w[0], bone.w[1], bone.w[2], 0,
      bone.c[0], bone.c[1], bone.c[2], 1);

    bone.t = t;

    bones.push(bone);
    nextjoint = skeleton[child].name;
    bonesRec(skeleton, nextjoint, bones, vecN);
  }
}

function nearestNeighbors(skeleton, points_skin){
  let indices = [];
  let distance;
  let closest;
  let index;
  for (let i = 0; i < points_skin.length; i++){
    let p = points_skin[i];
    for (let j = 0; j < skeleton.bones.length; j++){
      
      let ab = glMatrix.vec3.create();
      glMatrix.vec3.subtract(ab, skeleton.bones[j].joint1.pos, skeleton.bones[j].joint2.pos);
      
      let ap = glMatrix.vec3.create();
      glMatrix.vec3.subtract(ap, skeleton.bones[j].joint1.pos, p);

      let proj_ap_ab = projVector(ap, ab);

      if ((glMatrix.vec3.length(proj_ap_ab) < glMatrix.vec3.length(ab)) && 
      (glMatrix.vec3.dot(proj_ap_ab, ab) > 0)){
        dist_vec = glMatrix.vec3.create();
        glMatrix.vec3.subtract(dist_vec, ap, proj_ap_ab);
        distance = glMatrix.vec3.length(dist_vec);
      }

      else if ((glMatrix.vec3.length(proj_ap_ab) > glMatrix.vec3.length(ab)) && 
      (glMatrix.vec3.dot(proj_ap_ab, ab) > 0)){
        dist_vec = glMatrix.vec3.create();
        glMatrix.vec3.subtract(dist_vec, p, skeleton.bones[j].joint2.pos);
        distance = glMatrix.vec3.length(dist_vec);
      }

      else if (glMatrix.vec3.dot(proj_ap_ab, ab) < 0){
        dist_vec = glMatrix.vec3.create();
        glMatrix.vec3.subtract(dist_vec, p, skeleton.bones[j].joint1.pos);
        distance = glMatrix.vec3.length(dist_vec);
      }

      if ((j == 0) || (distance < closest)){
        closest = distance;
        index = j;
      }
    }
    indices.push(index);
  }
  return indices;
}

function getLocalCoords(bones, points_skin, indices){
  let coords = [];
  for (let i = 0; i < points_skin.length; i++){
    let vec3 = glMatrix.vec3.create();
    let mat_invert = glMatrix.mat4.create();
    glMatrix.mat4.invert(mat_invert, bones[indices[i]].t)
    vec3 = glMatrix.vec3.transformMat4(vec3, points_skin[i], mat_invert);
    coords.push(vec3);
  }
  return coords;
}

function getMatrixList(bones){
  matrices = [];
  for (let i = 0; i < bones.length; i++){
    matrices.push(bones[i].t);
  }
  return matrices;
}


/**
 * 
 * @param {object} skeleton The skeleton information
 * @param {SkinMesh} mesh The mesh for rendering the skin
 */
let globalSkeleton = null;
function main(skeleton, mesh) {

  setProperties(skeleton);
  //loopThrough(skeleton);
  mesh.render(mesh.canvas);
  //plotJoints(skeleton);
  let X = getMeshVertices(mesh);
  //plotSkeleton(skeleton);

  /**MAKE SKELETON AND BONES */

  skeleton.bones = [];
  skeleton.bones.name = "Bones";
  bonesRec(skeleton, "Root", skeleton.bones, [0,1,0]);

  let indices = [];
  indices = nearestNeighbors(skeleton, X);

  localCoords = [];

  localCoords = getLocalCoords(skeleton.bones, X, indices);

  let matrices = getMatrixList(skeleton.bones);

  mesh.updateRig(localCoords, indices, matrices);

  skeleton.bones = [];

  bonesRec(skeleton, "Root", skeleton.bones, [0,1,0]);
  matrices = getMatrixList(skeleton.bones);

  let animation = new Animation(mesh, skeleton);

  animation.animate();

  //plotSkeleton(skeleton);

  plotSkin(localCoords, indices);
  
}