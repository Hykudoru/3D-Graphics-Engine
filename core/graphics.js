function ToDeg(rad) {
    return rad * 180.0/PI;
}

function ToRad(deg) {
    return deg * PI/180.0;
}
let screenWidth = 700;//700;//screen.width - 20;
let screenHeight = 700; //screen.height - 20; //screen.height;// - 30;
let worldScale = .5;
//-----------GRAPHICS---------------

    class GraphicSettings
    {
        static culling = true;
        static invertNormals = false;
        static debugNormals = false;
        static perspective = true;
    }
   
    var forward = new Vec3(0,0,-1);
    var back = new Vec3(0,0,1);
    var right = new Vec3(1,0,0);
    var left = new Vec3(-1,0,0);
    var up = new Vec3(0,1,0);
    var down = new Vec3(0,-1,0);
    
    var orthographicProjectionMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ];

    var nearClippingPlane = -.1;
    var farClippingPlane = -1000;
    var fov = 60*Math.PI/180.0;
    // let perspectiveProjectionMatrix = [
    //     [1.0/Math.tan(fov/2), 0, 0, 0],
    //     [0, 1.0/Math.tan(fov/2), 0, 0],
    //     [0, 0, 1.0, 0],
    //     [0, 0, -1.0, 0]
    // ];
    // WebGL draws LH upside-down so we also invert y then z (again)
    let perspectiveProjectionMatrix = [
        [1.0/Math.tan(fov/2), 0, 0, 0],
        [0, -1.0/Math.tan(fov/2), 0, 0],
        [0, 0, -1.0, 0],
        [0, 0, -1.0, 0]
    ];

    function FOV(deg)
    {
        fov = ToRad(deg);
        perspectiveProjectionMatrix = [
            [1.0/Math.tan(fov/2), 0, 0, 0],
            [0, -1.0/Math.tan(fov/2), 0, 0],
            [0, 0, -1.0, 0],
            [0, 0, -1.0, 0]
        ]; 
        
        return perspectiveProjectionMatrix;
    }

    function ProjectPoint(point)
    {
        let p = point;
        
        if (p.v.length < 4) {
            p = Vec4.ToVec4(p);
        }
        
        if (GraphicSettings.perspective) {
            p = Matrix4x4VectorMult(perspectiveProjectionMatrix, p);
        } else {
            p = Matrix4x4VectorMult(orthographicProjectionMatrix, p);
        }
        p.x *= worldScale*screenWidth;
        p.y *= worldScale*screenHeight;
        return p;
    }

    function DrawTriangle(tri = []) {
        let p1 = tri[0];
        let p2 = tri[1];
        let p3 = tri[2];
        
        //Draw Triangle
        line(p1.x, p1.y, 0, p2.x, p2.y, 0);
        line(p2.x, p2.y, 0, p3.x, p3.y, 0);
        line(p3.x, p3.y, 0, p1.x, p1.y, 0);
    }

    class Transform
    {
        static transforms = [];
        static #transformCount = 0;

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
        
        constructor(scale = 1, position = new Vec3(0, 0, 0), rotationEuler = new Vec3(0, 0, 0))
        {
            this.scale.x = scale;
            this.scale.y = scale;
            this.scale.z = scale;
            this.position = position;
            this.rotation = YPR(rotationEuler.x, rotationEuler.y, rotationEuler.z);
            Transform.transforms[Transform.#transformCount++] = this;
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
        static main;
        static cameras = [];
        static #cameraCount = 0;
        name = "";
        constructor(scale = 1, position = new Vec3(0, 0, 0), rotationEuler = new Vec3(0, 0, 0))
        {
            super(scale, position, rotationEuler);
            if (Camera.#cameraCount == 0) {
                Camera.main = this;
            }
            Camera.cameras[Camera.#cameraCount++] = this;
            this.name = "Camera "+Camera.#cameraCount;
        }
    }

    let camera = new Camera();

    class Mesh extends Transform
    {
        static meshes = [];
        static #meshCount = 0;
        static worldTriangleCount = 0;
        static worldTriangleDrawCount = 0;
        vertices = [];
        projVertices = [];

        constructor(scale = 1, position = new Vec3(0, 0, 0), rotationEuler = new Vec3(0, 0, 0)) 
        {
            super(scale, position, rotationEuler);
            Mesh.meshes[Mesh.#meshCount++] = this;
            Mesh.worldTriangleCount += this.triangles(this.vertices).length;
        }

        triangles(verts) 
        {
            triangles = [];
            return triangles;
        }

        // --------Use this insead if you want to see through the object-------------
        // transformVertices() {
        //     //Transform
        //     for (let i = 0; i < this.vertices.length; i++) {
                
        //         // local space (Object space) coords (x, y, z) each point range [-1, 1]
        //         let vert = this.vertices[i];
                
        //         // Homogeneous coords (x, y, z, w=1)
        //         vert = new Vec4(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z, 1);

        //         // ======== World space ========
        //         // Transform local coords to world-space coords.
                
        //         let modelToWorldMatrix = this.TRS;
        //         let worldPoint = Matrix4x4VectorMult(modelToWorldMatrix, vert);
                
        //         // ====== View space ========
        //         // (Camera space, Eye space). Transform world coordinates to view coordinates.
        //         let worldToViewMatrix = camera.TRInverse;
        //         let cameraSpacePoint = Matrix4x4VectorMult(worldToViewMatrix, worldPoint);
                
        //         // ======== Screen space ==========
        //         // Project to screen space (image space) 
        //         let perspPoint = Matrix4x4VectorMult(perspectiveProjectionMatrix, cameraSpacePoint);
        //         perspPoint.x *= worldScale*screenWidth;
        //         perspPoint.y *= worldScale*screenHeight;

        //         this.projVertices[i] = perspPoint;
        //     }
        // }

        transformTriangles() {
            let projectedTriangles = [];
            
            //Transform Triangles
            let tris = this.triangles(this.vertices);
            for (let i = 0; i < tris.length; i++) 
            {
                let camSpaceTri = [];
                let tri = tris[i];
                for (let j = 0; j < tri.length; j++) 
                {
                    let vert = tri[j];// Local 3D (x,y,z)
                    // Homogeneous coords (x, y, z, w=1)
                    vert = new Vec4(vert.x, vert.y, vert.z, 1);

                    // =================== WORLD SPACE ===================
                    // Transform local coords to world-space coords.

                    let modelToWorldMatrix = this.TRS;
                    let worldPoint = Matrix4x4VectorMult(modelToWorldMatrix, vert);
                   
                    // ================ VIEW/CAM/EYE SPACE ================
                    // Transform world coordinates to view coordinates.

                    let worldToViewMatrix = Camera.main.TRInverse;
                    let cameraSpacePoint = Matrix4x4VectorMult(worldToViewMatrix, worldPoint);
                    camSpaceTri[j] = cameraSpacePoint;
                };
                
                // Still in View/Cam/Eye space
                //-------------------Normal/Culling------------------------
                let p1 = camSpaceTri[0];
                let p2 = camSpaceTri[1];
                let p3 = camSpaceTri[2];
                let centroid = new Vec3((p1.x+p2.x+p3.x)/3.0, (p1.y+p2.y+p3.y)/3.0, (p1.z+p2.z+p3.z)/3.0);
                
                let tooCloseToCamera = (p1.z >= nearClippingPlane || p2.z >= nearClippingPlane || p3.z >= nearClippingPlane || centroid.z >= nearClippingPlane);
                let tooFarFromCamera = (p1.z <= farClippingPlane || p2.z <= farClippingPlane || p3.z <= farClippingPlane || centroid.z <= farClippingPlane);
                let behindCamera = DotProduct(Normalized(centroid), forward) <= 0;    
                if (tooCloseToCamera || tooFarFromCamera || behindCamera) {
                    continue; // Skip triangle if it's out of cam view.
                }
                
                // Calculate triangle suface Normal
                let a = VectorSub(p3, p1);
                let b = VectorSub(p2, p1);
                let normal = Normalized(CrossProduct(a, b));

                if (GraphicSettings.invertNormals) {
                    normal = VectorScale(normal, -1.0)
                }
                
                if (GraphicSettings.culling)
                {
                    // Back-face culling - Checks if the triangles backside is facing the camera.
                    let normalizedFromCamPos = Normalized(centroid);// Since camera is (0,0,0) in view space, the displacement vector from camera to centroid IS the centroid itself.
                    let camVisible = DotProduct(normalizedFromCamPos, normal) <= 0;
                    
                    if (!camVisible) {
                        continue;// Skip triangle if it's out of cam view or it's part of the other side of the mesh.
                    } 
                }

                // ================ SCREEN SPACE ==================
                // Project to screen space (image space) 

                if (GraphicSettings.debugNormals)
                {
                    //---------Draw triangle centroid and normal-----------
                    let projCentroidToNormal = ProjectPoint(Vec4.ToVec4(VectorSum(centroid, normal)));
                    let projCentroid = ProjectPoint(Vec4.ToVec4(centroid));
                    point(projCentroid.x, projCentroid.y, 0);
                    line(projCentroid.x, projCentroid.y, 0, projCentroidToNormal.x, projCentroidToNormal.y, 0);
                }

                //Project single triangle from 3D to 2D
                let projectedTri = []
                for (let j = 0; j < 3; j++) {
                    const cameraSpacePoint = camSpaceTri[j]; 
                    projectedTri[j] = ProjectPoint(cameraSpacePoint);
                }; 
                //Add projected tri
                projectedTriangles[i] = projectedTri;
            }

            return projectedTriangles;
        }

        drawMesh() {
            strokeWeight(2);
            let projectedTriangles = this.transformTriangles();
            Mesh.worldTriangleDrawCount += projectedTriangles.length;
            projectedTriangles.forEach(tri => {
                DrawTriangle(tri);
            });
        }

        static DrawMeshes() {
            Mesh.worldTriangleDrawCount = 0;
            Mesh.meshes.forEach(mesh => {
                mesh.drawMesh();
            });
        }
    }

    class CubeMesh extends Mesh
    {
        constructor(scale = 1, position = new Vec3(0, 0, 0), rotationEuler = new Vec3(0, 0, 0))
        {
            super(scale, position, rotationEuler);

            // Local Space (Object Space)
            this.vertices = [
                //south
                { x: -1, y: -1, z: 1 },
                { x: -1, y: 1, z: 1 },
                { x: 1, y: 1, z: 1 },
                { x: 1, y: -1, z: 1 },
                //north
                { x: -1, y: -1, z: -1 },
                { x: -1, y: 1, z: -1 },
                { x: 1, y: 1, z: -1 },
                { x: 1, y: -1, z: -1 },
            ];
        }

        triangles(verts) {
            let triangles = [
                //south
                [verts[0], verts[1], verts[2]],
                [verts[0], verts[2], verts[3]],
                //north
                [verts[7], verts[6], verts[5]],
                [verts[7], verts[5], verts[4]],
                //right
                [verts[3], verts[2], verts[6]],
                [verts[3], verts[6], verts[7]],
                //left
                [verts[4], verts[5], verts[1]],
                [verts[4], verts[1], verts[0]],
                //top
                [verts[1], verts[5], verts[6]],
                [verts[1], verts[6], verts[2]],
                //bottom
                [verts[3], verts[7], verts[4]],
                [verts[3], verts[4], verts[0]],
            ];

            return triangles;
        }
    }