window.onkeyup = function(e) {
    moveDir = new Vec3(0,0,0);
}

window.onkeypress = function(e) 
{
    moveDir = new Vec3(0,0,0);
    //----------Camera Controls-------
    // FORWARD
    if (e.key == 'w') {
        moveDir = VectorSum(moveDir, camera.forward);
    }
    // BACK
    if (e.key == 's') {
        moveDir = VectorSum(moveDir, camera.back);
    }
    // LEFT
    if (e.key == 'a') {
        moveDir = VectorSum(moveDir, camera.left);
    }
    // RIGHT
    if (e.key == 'd') {
        moveDir = VectorSum(moveDir, camera.right);
    }
    // UP
    if (e.key == ' ') {
        moveDir = VectorSum(moveDir, camera.up);
    }
    // DOWN
    if (e.key == 'c') {
        moveDir = VectorSum(moveDir, camera.down);
    }

    // ROTATE CCW
    if (e.key == 'q') {
        camera.rotation = MatrixMultiply(camera.rotation, RotZ(-PI/90));
    }
    // ROTATE CW
    else if (e.key == 'e') {
        camera.rotation = MatrixMultiply(camera.rotation, RotZ(PI/90));
    }

    // ---------------- FOV ------------------
    if (e.key == ".")
    {
        FOV(ToDeg(fov) + 5);
        console.log("FOV: "+ToDeg(fov));
    }
    if (e.key == ",")
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
        c.position = VectorSum(camera.position, VectorScale(camera.forward, 10));
        console.log(c.position.ToString());
    }
};

let prevMouseX = 0;
let prevMouseY = 0;
let deltaMouseX = 0;
let deltaMouseY = 0;

onmousemove = function() {
    deltaMouseX = mouseX - prevMouseX;
    deltaMouseY = mouseY - prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    camera.rotation = MatrixMultiply(camera.rotation, YPR(0.008*deltaMouseY, .008 * -deltaMouseX, 0));
    let local = camera.localPosition;

    console.log("Camera local pos:"+local.ToString());
    console.log("Camera pos:"+camera.position.ToString());
};

onkeydown = function(e) {
    e.key == 'o';
}