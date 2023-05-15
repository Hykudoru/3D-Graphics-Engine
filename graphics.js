    //-----------GRAPHICS---------------
    
    var forward = { x: 0, y: 0, z: -1 };
    var back = { x: 0, y: 0, z: 1 };
    var right = { x: 1, y: 0, z: 0 };
    var left = { x: -1, y: 0, z: 0 };
    var up = { x: 0, y: -1, z: 0 };
    var down = { x: 0, y: 1, z: 0 };
    
    var orthographicProjectionMatrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ];

    let screenWidth = 700;//screen.width - 20;
    let screenHeight = 700; //screen.height - 20; //screen.height;// - 30;
    let worldScale = .5;
    var fov = 60*Math.PI/180.0;
    let perspectiveProjectionMatrix = [
        [1.0/Math.tan(fov/2), 0, 0, 0],
        [0, 1.0/Math.tan(fov/2), 0, 0],
        [0, 0, 1, 0],
        [0, 0, -1, 0]
    ]; 

    function ToDeg(rad) {
        return rad * 180.0/PI;
    }
    
    function ToRad(deg) {
        return deg * PI/180.0;
    }

    function FOV(deg) {
        PerspectiveMatrix(deg);
    }

    function PerspectiveMatrix(degFOV)
    {  
        fov = ToRad(degFOV);
        perspectiveProjectionMatrix = [
            [1.0/Math.tan(fov/2), 0, 0, 0],
            [0, 1.0/Math.tan(fov/2), 0, 0],
            [0, 0, 1, 0],
            [0, 0, -1, 0]
        ]; 
        
        return perspectiveProjectionMatrix;
    }

    class Transform
    {
        scale = new Vec3(1, 1, 1);
        position = new Vec3(0, 0, 0);
        rotation = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
        get forward() {return MatrixVectorMultiply(this.rotation, forward);}
        get back() {return MatrixVectorMultiply(this.rotation, back);}
        get right() {return MatrixVectorMultiply(this.rotation, right);}
        get left() {return MatrixVectorMultiply(this.rotation, left);}
        get up() {return MatrixVectorMultiply(this.rotation, up);}
        get down() {return MatrixVectorMultiply(this.rotation, down);}
        get localPosition() {return Matrix4x4VectorMult(this.translationMatrix4x4Inverse, new Vec4(this.position.x, this.position.y, this.position.z, 1));}
        // constructor(position = new Vec3(0, 0, 0), rotationEuler = new Vec3(0, 0, 0), scale = new Vec3(1, 1, 1))
        // {
        //     this.scale = scale;
        //     this.position = position;
        //     this.rotation = YPR(rotationEuler.x, rotationEuler.y, rotationEuler.z);
        // }
        constructor(scale = 1) {
            this.scale.x = scale;
            this.scale.y = scale;
            this.scale.z = scale;
        }

        get scalingMatrix4x4() 
        {
            return [
                [this.scale.x, 0, 0, 0],
                [0, this.scale.y, 0, 0],
                [0, 0, this.scale.z, 0],
                [0, 0, 0, 1]
            ];
        }

        get rotationMatrix4x4() {
                return [
                    [this.rotation[0][0], this.rotation[0][1], this.rotation[0][2], 0],
                    [this.rotation[1][0], this.rotation[1][1], this.rotation[1][2], 0],
                    [this.rotation[2][0], this.rotation[2][1], this.rotation[2][2], 0],
                    [       0,                      0,                  0,          1]
                ];
        }        

        get translationMatrix4x4() {
            return [
                [1, 0, 0, this.position.x],
                [0, 1, 0, this.position.y],
                [0, 0, 1, this.position.z],
                [0, 0, 0, 1]
            ];
        }

        get translationMatrix4x4Inverse() {
            return [
                [1, 0, 0, -this.position.x],
                [0, 1, 0, -this.position.y],
                [0, 0, 1, -this.position.z],
                [0, 0, 0, 1]
            ];
        }

        get TRS() {
            return MatrixMult4x4(MatrixMult4x4(this.translationMatrix4x4, this.rotationMatrix4x4), this.scalingMatrix4x4);
            //return MatrixMult4x4(this.translationMatrix4x4, MatrixMult4x4(this.rotationMatrix4x4, this.scalingMatrix4x4));
        }

        get TR() {
            return MatrixMult4x4(this.translationMatrix4x4, this.rotationMatrix4x4);
        }

        get TRInverse() {
            return MatrixMult4x4(Transpose4x4(this.rotationMatrix4x4), this.translationMatrix4x4Inverse);
        }
    }

    class Camera extends Transform
    {

    }

    let camera = new Transform();
    class Mesh extends Transform
    {
        static meshes = [];
        static #meshCount = 0;
        vertices = [];
        projVertices = [];

        constructor(scale = 1) {
            super(scale);
            Mesh.meshes[Mesh.#meshCount++] = this;
        }

        get triangles() {
            let triangles = [];
            return triangles;
        }

        transformVertices() {
            //Transform
            for (let i = 0; i < this.vertices.length; i++) {
                
                // local space (Object space) coords (x, y, z) each point range [-1, 1]
                let vert = this.vertices[i];
                
                // Homogeneous coords (x, y, z, w=1)
                vert = new Vec4(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z, 1);

                // ======== World space ========
                // Transform local coords to world-space coords.
                
                let modelToWorldMatrix = this.TRS;
                let worldPoint = Matrix4x4VectorMult(modelToWorldMatrix, vert);
                
                // ====== View space ========
                // (Camera space, Eye space). Transform world coordinates to view coordinates.
                let worldToViewMatrix = camera.TRInverse;
                let cameraSpacePoint = Matrix4x4VectorMult(worldToViewMatrix, worldPoint);
                
                // ======== Screen space ==========
                // Project to screen space (image space) 
                let perspPoint = Matrix4x4VectorMult(perspectiveProjectionMatrix, cameraSpacePoint);
                //perspPoint = VectorScale(perspPoint, worldScale);
                perspPoint.x *= worldScale*screenWidth;
                perspPoint.y *= worldScale*screenHeight;
                this.projVertices[i] = perspPoint;
            }
        }

        drawTriangles() {
            // Draw Triangles
            for (let t = 0; t < this.triangles.length; t++) {
                strokeWeight(2);
                let triPoints = this.triangles[t];
                let p1 = triPoints[0];
                let p2 = triPoints[1];
                let p3 = triPoints[2];
                let dir = VectorSub(this.position, camera.position);
                dir = Normalized(dir);
                let dot = DotProduct(dir, camera.forward);
                if (-dot < 0) {
                    line(p1.x, p1.y, 0, p2.x, p2.y, 0);
                    line(p2.x, p2.y, 0, p3.x, p3.y, 0);
                    line(p3.x, p3.y, 0, p1.x, p1.y, 0);
                }
            }
        }

        DrawMesh() {
            this.transformVertices();
            this.drawTriangles();
        }
    }

    class CubeMesh extends Mesh
    {
        // Local Space (Object Space)
        vertices = [
            { x: -1, y: 1, z: 1 },
            { x: -1, y: -1, z: 1 },
            { x: 1, y: -1, z: 1 },
            { x: 1, y: 1, z: 1 },
            //forward
            { x: -1, y: 1, z: -1 },
            { x: -1, y: -1, z: -1 },
            { x: 1, y: -1, z: -1 },
            { x: 1, y: 1, z: -1 }
        ];

        projVertices = [];
        constructor(scale = 1) {
            super(scale);
        }
        get triangles() {
            let triangles = [
                //south
                [this.projVertices[0], this.projVertices[1], this.projVertices[2]],
                [this.projVertices[0], this.projVertices[2], this.projVertices[3]],
                //north
                [this.projVertices[7], this.projVertices[6], this.projVertices[5]],
                [this.projVertices[7], this.projVertices[5], this.projVertices[4]],
                //right
                [this.projVertices[3], this.projVertices[2], this.projVertices[6]],
                [this.projVertices[3], this.projVertices[6], this.projVertices[7]],
                //left
                [this.projVertices[4], this.projVertices[5], this.projVertices[1]],
                [this.projVertices[4], this.projVertices[1], this.projVertices[0]],
                //top
                [this.projVertices[1], this.projVertices[5], this.projVertices[6]],
                [this.projVertices[1], this.projVertices[6], this.projVertices[2]],
                //bottom
                [this.projVertices[3], this.projVertices[7], this.projVertices[4]],
                [this.projVertices[3], this.projVertices[4], this.projVertices[0]],
            ];

            return triangles;
        }
        
       
    }