/**
 * Return Plotly plots of equal axes that contain a set of vectors
 * @param {list of glMatrix.vec3} vs
 * @return x, y, and z axes plots 
 */
 function getAxesEqual(vs) {
  //Determine the axis ranges
  minval = 0;
  maxval = 0;
  for (let i = 0; i < vs.length; i++) {
      for (let j = 0; j < 3; j++) {
          if (vs[i][j] < minval){ minval = vs[i][j]; }
          if (vs[i][j] > maxval){ maxval = vs[i][j]; }
      }
  }
  return [
  { x: [minval, maxval], y: [0, 0], z: [0, 0],
    mode: 'lines', line: {color: '#000000', width: 1}, type: 'scatter3d', name:'xaxis'
  },
  { x: [0, 0], y: [minval, maxval], z: [0, 0],
    mode: 'lines', line: {color: '#000000', width: 1}, type: 'scatter3d', name:'yaxis'
  },
  { x: [0, 0], y: [0, 0], z: [minval, maxval],
    mode: 'lines', line: {color: '#000000', width: 1}, type: 'scatter3d', name:'zaxis'
  }];
}



/**
 * Plot the skeleton joints
 * @param {object} skeleton The skeleton information
 */
function plotJoints(skeleton) {
    let x = [];
    let y = [];
    let z = [];
    let points = [x, y, z];
    let labels = [];

    for (const [key, value] of Object.entries(skeleton)) {
        // Swap z and y so plotly plots the skeleton upright by default
        x.push(-value.pos[0]);
        y.push(value.pos[2]);
        z.push(value.pos[1]);
        labels.push(key);
    }

    const joints = { x: x, y: y, z: z,
      mode: 'markers', line: {color: '#000000', width: 2},
      type: 'scatter3d', name:'joints',
      marker: {color: '#000000', size: 2, symbol: 'circle'}
    };
    let data = getAxesEqual(points);
    data.push(joints);
    const layout = {margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      }};
    Plotly.newPlot('debugCanvas', data, layout);
}



/**
 * Plot the skin, coloring by the y value
 * 
 * @param {list of vec3} X Positions of each point on the skin
 */
 function plotSkin(X, indices) {
  // Create chain plot element
  let x = [];
  let y = [];
  let z = [];
  let idx = [];
  let count = 0;
  for (let xi of X) {
    x.push(-xi[0]);
    y.push(xi[2]);
    z.push(xi[1]);
    idx.push(indices[count]);
    count++;
  }
  let data = getAxesEqual([x, y, z]);
  data.push(
    {
      x:x, y:y, z:z,
      mode: 'markers',
      type: 'scatter3d', name:'skin',
      marker: {color: idx, size: 1, symbol: 'circle', colorscale:'Picnic'}
    }
  );
  const layout = {margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0
  }};
  Plotly.newPlot('debugCanvas', data, layout);
}

function plotSkeleton(skeleton) {
  //Determine the axis ranges
  let x = [];
  let y = [];
  let z = [];
  for (let joint in skeleton){
    joint = skeleton[joint];
    if (joint.name != "Bones"){
      x.push(joint.pos[0]);
      y.push(joint.pos[2]);
      z.push(joint.pos[1]);
    }
  }
  let lines = getAxesEqual([x, y, z]);
  for (let joint in skeleton) {
    joint = skeleton[joint]
    if (joint.name != "Bones"){
      for(let child of joint.children) {
        child = skeleton[child];
        lines.push(  { x: [-child.pos[0], -joint.pos[0]], y: [child.pos[2], 
          joint.pos[2]], z: [child.pos[1], joint.pos[1]],
          mode: 'lines', line: {color: '#000000', width: 6}, type: 'scatter3d', name: child.name
        });
      }
    }
  }
  const layout = {margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0
  }};
  Plotly.newPlot('debugCanvas', lines, layout);
}

function plotChain(skeleton, chain) {
  //Determine the axis ranges
  let x = [];
  let y = [];
  let z = [];
  for (let joint in skeleton){
    joint = skeleton[joint]
    x.push(joint.pos[0]);
    y.push(joint.pos[2]);
    z.push(joint.pos[1]);
  }
  let lines = getAxesEqual([x, y, z]);

  for (let joint in skeleton) {
    joint = skeleton[joint]
    for(let child of joint.children) {
      child = skeleton[child];
      lines.push(  { x: [-child.pos[0], -joint.pos[0]], y: [child.pos[2], 
        joint.pos[2]], z: [child.pos[1], joint.pos[1]],
        mode: 'lines', line: {color: '#000000', width: 6}, type: 'scatter3d', name: child.name
      });
    }
  }
  for (let i = 0; i < chain.length-1; i++) {
    lines.push(  { x: [-chain[i].pos[0], -chain[i+1].pos[0]], y: [chain[i].pos[2], 
      chain[i+1].pos[2]], z: [chain[i].pos[1], chain[i+1].pos[1]],
      mode: 'lines', line: {color: '#ff0000', width: 6}, type: 'scatter3d', name: chain[i].name
    });
  }
  const layout = {margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0
  }};
  Plotly.newPlot('debugCanvas', lines, layout);
}