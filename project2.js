/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.enableLightLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
        this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');
        this.blendModeLoc = gl.getUniformLocation(this.prog, 'blendMode');

        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normalbuffer = gl.createBuffer();

        this.numTriangles = 0;
        this.lightEnabled = false;
        this.ambient = 0.5;
        this.lightPos = [1.0, 1.0, 1.0];
        this.specularIntensity = 0.5;
        this.shininess = 16.0;
        this.blendMode = 0; // 0: Normal, 1: Multiply, 2: Mix

        this.texture1 = null;
        this.texture2 = null;
    }
	//task 2 edit setmesh
	setMesh(vertPos, texCoords, normalCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

	setTexture1(img) {
        this.texture1 = this.loadTexture(img);
    }

    setTexture2(img) {
        this.texture2 = this.loadTexture(img);
    }

	loadTexture(img) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            img
        );

        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        return texture;
    }

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.

	//task 2 edit draw.
	draw(trans) {
        gl.useProgram(this.prog);

        gl.uniformMatrix4fv(this.mvpLoc, false, trans);
        gl.uniform1i(this.showTexLoc, true);
        gl.uniform1i(this.enableLightLoc, this.lightEnabled);
        gl.uniform1f(this.ambientLoc, this.ambient);
        gl.uniform3fv(this.lightPosLoc, this.lightPos);
        gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
        gl.uniform1f(this.shininessLoc, this.shininess);
        gl.uniform1i(this.blendModeLoc, this.blendMode);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        gl.uniform1i(gl.getUniformLocation(this.prog, 'tex1'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        gl.uniform1i(gl.getUniformLocation(this.prog, 'tex2'), 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.enableVertexAttribArray(this.vertPosLoc);
        gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.enableVertexAttribArray(this.texCoordLoc);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

	

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			
			/**
			 * @Task1 : You should implement this part to accept non power of 2 sized textures
			 */
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		}

		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(enable) {
        this.lightEnabled = enable;
    }
	
	setAmbientLight(value) {
        this.ambient = value;
    }

	setSpecularLight(intensity) {
        this.specularIntensity = intensity;
    }

	setBlendMode(mode) {
        this.blendMode = mode;
    }
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

function SetSpecularLight(param) {
    meshDrawer.setSpecularLight(parseFloat(param.value));
    DrawScene();
}

function LoadTexture1(param) {
    if (param.files && param.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                meshDrawer.setTexture1(img);
                DrawScene();
            };
        };
        reader.readAsDataURL(param.files[0]);
    }
}

function LoadTexture2(param) {
    if (param.files && param.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                meshDrawer.setTexture2(img);
                DrawScene();
            };
        };
        reader.readAsDataURL(param.files[0]);
    }
}

function SetBlendMode(param) {
    meshDrawer.setBlendMode(parseInt(param.value));
    DrawScene();
}

// Updated Vertex Shader (meshVS)
const meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;
    attribute vec3 normal;

    uniform mat4 mvp;

    varying vec2 v_texCoord;
    varying vec3 v_normal;

    void main() {
        v_texCoord = texCoord;
        v_normal = normal;
        gl_Position = mvp * vec4(pos, 1.0);
    }
`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
    precision mediump float;

    uniform bool showTex;
    uniform bool enableLighting;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform int blendMode; // 0: Normal, 1: Multiply, 2: Mix
    uniform vec3 lightPos;
    uniform float ambient;
    uniform float specularIntensity;
    uniform float shininess;

    varying vec2 v_texCoord;
    varying vec3 v_normal;

    void main() {
        vec4 texColor1 = texture2D(tex1, v_texCoord);
        vec4 texColor2 = texture2D(tex2, v_texCoord);
        vec3 normal = normalize(v_normal);

        vec3 lightDir = normalize(lightPos - vec3(0.0, 0.0, 0.0));
        vec3 viewDir = normalize(-vec3(0.0, 0.0, 1.0));
        vec3 reflectDir = reflect(-lightDir, normal);

        float diff = max(dot(normal, lightDir), 0.0);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);

        vec4 diffuse = vec4(diff, diff, diff, 1.0);
        vec4 specular = vec4(specularIntensity * spec, specularIntensity * spec, specularIntensity * spec, 1.0);
        vec4 ambientLight = vec4(ambient, ambient, ambient, 1.0);

        vec4 blendedTexColor;
        if (blendMode == 0) {
            blendedTexColor = texColor1;
        } else if (blendMode == 1) {
            blendedTexColor = texColor1 * texColor2;
        } else {
            blendedTexColor = mix(texColor1, texColor2, 0.5);
        }

        if (showTex && enableLighting) {
            gl_FragColor = blendedTexColor * (diffuse + specular + ambientLight);
        } else if (showTex) {
            gl_FragColor = blendedTexColor;
        } else {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    }
`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////