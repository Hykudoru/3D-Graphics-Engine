// Returns a Rotation Matrix about the X axis (in radians)
    // | 1,   0,      0     |
    // | 0, Cos(T), -Sin(T) |
    // | 0, Sin(T),  Cos(T) |
    function RotX(theta) {
        let Cos = Math.cos(theta);
        let Sin = Math.sin(theta);

        let matrix = [
            [1, 0, 0],
            [0, Cos, -Sin],
            [0, Sin, Cos]
        ];

        return matrix;
    }

    // Returns a Rotation Matrix about the Y axis (in radians)
    // | Cos(T),  0,   Sin(T)  |
    // |   0,     1,     0     |
    // |-Sin(T),  0,   Cos(T)  |
    function RotY(theta) {
        let Cos = Math.cos(theta);
        let Sin = Math.sin(theta);

        let matrix = [
            [Cos, 0, Sin],
            [0, 1, 0],
            [-Sin, 0, Cos]
        ];

        return matrix;
    }

    // Returns a Rotation Matrix about the Z axis (in radians)
    // | Cos(T), -Sin(T), 0 |
    // | Sin(T),  Cos(T), 0 |
    // |   0,      0,     1 |
    function RotZ(theta) {
        let Cos = Math.cos(theta);
        let Sin = Math.sin(theta);

        let matrix = [
            [Cos, -Sin, 0],
            [Sin, Cos, 0],
            [0, 0, 1]
        ];

        return matrix;
    }

    // Yaw-Pitch-Roll z-y'-x''(intrinsic rotation) or x-y-z (extrinsic rotation)
    function YPR(roll, pitch, yaw) {
        let rotationMatrix = MatrixMultiply(MatrixMultiply(RotZ(yaw), RotY(pitch)), RotX(roll));//MatrixMultiply(rotation.matrix, RotZ(PI/2.0).matrix);
        return rotationMatrix;
    }

class Vec3 
{
    v = [0, 0, 0];
    get x() { return this.v[0];} set x(val) {this.v[0] = val;}
    get y() { return this.v[1];} set y(val) {this.v[1] = val;}
    get z() { return this.v[2];} set z(val) {this.v[2] = val;}

    constructor(x = 0, y = 0, z = 0) {
        this.v[0] = x;
        this.v[1] = y;
        this.v[2] = z;
    }

    static zero = new Vec3(0,0,0);
    static one = new Vec3(1.0, 1.0, 1.0);
    
    ToString() {
        let str = "";
        this.v.forEach(element => {
            str += " "+Math.round(element);
        });
        str += "\n\r";

        return str;
    }
}

class Vec4 extends Vec3 
{
    get w() { return this.v[3]} set w(val) {this.v[3] = val;}
    
    static ToVec3(vec4)
    {
        return new Vec3(vec4.x, vec4.y, vec4.z);    
    }

    static ToVec4(vec3)
    {
        return new Vec4(vec3.x, vec3.y, vec3.z, 1);    
    }

    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z);
        this.v[3] = w;
    }
}

class Matrix3x3 
{
    matrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    
    constructor(mtx3x3)
    {
        let matrix = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];

        this.matrix = mtx3x3 || matrix;
    }
}

class Matrix4x4 
{    
    constructor(mtx4x4)
    {
        let matrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];

        this.matrix = mtx4x4 || matrix;
    }
}

    function VectorScale(vector, scaler) {
        let vec = new Vec3();
        vec.x = vector.x * scaler;
        vec.y = vector.y * scaler;
        vec.z = vector.z * scaler;

        return vec;
    }

    function VectorSum(a, b) {
        let vec = new Vec3((a.x + b.x), (a.y + b.y), (a.z + b.z));
        return vec;
    }

    function VectorSub(a, b) {
        let vec = new Vec3((a.x - b.x), (a.y - b.y), (a.z - b.z));
        return vec;
    }

    function Magnitude(vec) {
        return Math.sqrt((vec.x*vec.x) + (vec.y*vec.y) + (vec.z*vec.z));
    }

    function Normalized(vec3) {
        let vec = new Vec3(vec3.x, vec3.y, vec3.z);
        let mag = Magnitude(vec);
        vec.x /= mag;
        vec.y /= mag;
        vec.z /= mag;
        return vec;
    }

    function SqrMag(vec3) {
        return (vec3.x*vec3.x) + (vec3.y*vec3.y) + (vec3.z*vec3.z)
    }

    function DotProduct(vecA, vecB) {
        return (vecA.x * vecB.x) + (vecA.y * vecB.y) + (vecA.z * vecB.z);
    }

    function CrossProduct(a, b)
    {
        /* Matrix
        |  i | j | k  |
        | a.x a.y a.z |
        | b.x b.y b.z |
        */
        
        let u = new Vec3();
        u.x = (a.y*b.z - a.z*b.y); //i 
        u.y = -(a.x*b.z) + (a.z*b.x);// -(a.x*b.z - a.z*b.x), //-j
        u.z = (a.x*b.y - a.y*b.x); //k
        /* To check is orthogonal: bool isPerpendicular = dotProduct(u, a) == 0 && dotProduct(u, b) == 0;
        */
        return u; 
    }

    function MatrixMultiply(matrix, columnMatrix) {
        let mtx = new Matrix3x3();
        for (var r = 0; r < 3; r++) {
            let rowVec = new Vec3(matrix[r][0], matrix[r][1], matrix[r][2]);
            for (var c = 0; c < 3; c++) {
                let columnVec = new Vec3(columnMatrix[0][c], columnMatrix[1][c], columnMatrix[2][c]);
                mtx.matrix[r][c] = DotProduct(rowVec, columnVec);
            }
        }

        return mtx.matrix;
    }

    function MatrixVectorMultiply(matrix, columnVector) {
        let result = [0, 0, 0];
        for (var r = 0; r < 3; r++) {
            let rowVec = new Vec3(matrix[r][0], matrix[r][1], matrix[r][2]);
            result[r] = DotProduct(rowVec, columnVector);
        }

        return new Vec3(result[0], result[1], result[2]);
    }

    //--------------- 4x4 ---------------------

    function Transpose4x4(matrix) {
        let mtx = new Matrix4x4();

        for (var r = 0; r < 4; r++) {
            mtx.matrix[0][r] = matrix[r][0];
            mtx.matrix[1][r] = matrix[r][1];
            mtx.matrix[2][r] = matrix[r][2];
            mtx.matrix[3][r] = matrix[r][3];
        }

        return mtx.matrix;
    }

    function Dot4(vecA, vecB) {
        return (vecA.x * vecB.x) + (vecA.y * vecB.y) + (vecA.z * vecB.z) + (vecA.w * vecB.w);
    }

    function MatrixMult4x4(matrix, columnMatrix) {
        let mtx = new Matrix4x4();
        for (var r = 0; r < 4; r++) {
            let rowVec = new Vec4(matrix[r][0], matrix[r][1], matrix[r][2], matrix[r][3]);
            for (var c = 0; c < 4; c++) {
                let columnVec = new Vec4(columnMatrix[0][c], columnMatrix[1][c], columnMatrix[2][c], columnMatrix[3][c]);
                mtx.matrix[r][c] = Dot4(rowVec, columnVec);
            }
        }

        return mtx.matrix;
    }

    function Matrix4x4VectorMult(matrix, vec4) {
        let result = new Vec4();
        for (var r = 0; r < 4; r++) {
            let rowVec = new Vec4(matrix[r][0], matrix[r][1], matrix[r][2], matrix[r][3]);
            result.v[r] = Dot4(rowVec, vec4);
        }

        if (result.w != 0.0) {
            result.x /= result.w;
            result.y /= result.w;
            result.z /= result.w;
            // result.w /= result.w;
        }

        return result;
    } 