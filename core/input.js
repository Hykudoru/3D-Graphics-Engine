

let prevMouseX = 0;
let prevMouseY = 0;
let deltaMouseX = 0;
let deltaMouseY = 0;

onmousemove = function() {
    // let mouse = MatrixVectorMultiply(webGLCoordinateMatrix, new Vec3(mouseX, mouseY,0));
    let x = mouseX;
    let y = -mouseY;
    deltaMouseX = x - prevMouseX;
    deltaMouseY = y - prevMouseY;
    prevMouseX = x;
    prevMouseY = y;
    
    Camera.main.rotation = MatrixMultiply(Camera.main.rotation, YPR(0.008*deltaMouseY, 0.008*-deltaMouseX, 0));
};

var moveDir = new Vec3();

window.onkeyup = function(e) {
    moveDir = new Vec3(0,0,0);
}

window.onkeypress = function(e) 
{
    moveDir = new Vec3(0,0,0);
    //----------Camera Controls-------
    // FORWARD
    if (e.key == 'w') {
        moveDir = VectorSum(moveDir, Camera.main.forward);
    }
    // BACK
    if (e.key == 's') {
        moveDir = VectorSum(moveDir, Camera.main.back);
    }
    // LEFT
    if (e.key == 'a') {
        moveDir = VectorSum(moveDir, Camera.main.left);
    }
    // RIGHT
    if (e.key == 'd') {
        moveDir = VectorSum(moveDir, Camera.main.right);
    }
    // UP
    if (e.key == ' ') {
        moveDir = VectorSum(moveDir, Camera.main.up);
    }
    // DOWN
    if (e.key == 'c') {
        moveDir = VectorSum(moveDir, Camera.main.down);
    }

    // ROTATE CCW
    if (e.key == 'q') {
        Camera.main.rotation = MatrixMultiply(Camera.main.rotation, RotZ(PI/90));
    }
    // ROTATE CW
    else if (e.key == 'e') {
        Camera.main.rotation = MatrixMultiply(Camera.main.rotation, RotZ(-PI/90));
    }
    // Reset Camera
    else if (e.key == '0')
    {
        // Camera.main.reset();
        //Fix later
        Camera.main.rotation = Matrix3x3.identity;
        Camera.main.position = Vec3.zero;
    }
    else if (e.key == 1) {
        Camera.main = Camera.cameras[0];
    }
    else if (e.key == 2) {
        Camera.main = Camera.cameras[1];
    }
    // ---------------- FOV ------------------
    if (e.key == ".")// <
    {
        FOV(ToDeg(fov) + 5);
        console.log("FOV: "+ToDeg(fov));
    }
    if (e.key == ",")// >
    {
        FOV(ToDeg(fov) - 5);
        console.log("FOV: "+ToDeg(fov));
    }
    
    // ---------------- Physics ------------------

    // Toggle momentum
    if (e.key == 'x') {
        velocity = new Vec3(0,0,0);//Reset every toggle state
        isKinematic = !isKinematic;
    }

    // Toggle dampeners
    if (e.key == 'z') {
        dampenersActive = !dampenersActive;
    }
   
    // ---------------- ------------------
    
    // Spawn Mesh
    if (e.key === '`') {
        let c = new CubeMesh(1);
        c.position = VectorSum(Camera.main.position, VectorScale(Camera.main.forward, 10));
        console.log(c.position.ToString());
    }
};


// Debugging
onkeydown = function(e) {
    if(e.key == '-') {
        GraphicSettings.invertNormals = !GraphicSettings.invertNormals;
    }
    if(e.key == 'n') {
        GraphicSettings.debugNormals = !GraphicSettings.debugNormals;
    }
    if (e.key == 'v') {
        GraphicSettings.culling = !GraphicSettings.culling;
    }
    if (e.key == 'p') {
        GraphicSettings.perspective = !GraphicSettings.perspective;
    }
}