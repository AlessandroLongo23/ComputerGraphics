class Quaternion {
	constructor(opt_src) {
		var v = new Float32Array(4);
		if (opt_src && typeof opt_src === 'object') {
			if (opt_src.elements)
				v.set(opt_src.elements);
			else
				v.set(opt_src);
		} else {
			v[0] = 0; 
			v[1] = 0; 
			v[2] = 0; 
			v[3] = 1;
		}

		this.elements = v;
	}

	setIdentity = () => {
		var e = this.elements;
		e[0] = 0; 
		e[1] = 0; 
		e[2] = 0; 
		e[3] = 1;
		return this;
	};

	set = (src) => {
		var s = src.elements ? src.elements : src;
		var d = this.elements;
		if (s === d)
			return;
	
		for (var i = 0; i < 4; ++i)
			d[i] = s[i];
	
		return this;
	};

	apply = (vec) => {
		var p = new Quaternion(vec);
		var q = new Quaternion(this);
		var q_inv = new Quaternion(this);
		q_inv = q_inv.invert();
		p = p.multiply(q_inv);
		p = q.multiply(p);
		var result = p.elements;
		return vec3(result[0], result[1], result[2]);
	}

	multiply = (other) => {
		var e = this.elements;
		var a = new Float32Array(this.elements);
		var b = new Float32Array(other.elements);
		e[0] = a[1] * b[2] - a[2] * b[1] + b[3] * a[0] + a[3] * b[0];
		e[1] = a[2] * b[0] - a[0] * b[2] + b[3] * a[1] + a[3] * b[1];
		e[2] = a[0] * b[1] - a[1] * b[0] + b[3] * a[2] + a[3] * b[2];
		e[3] = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];
		return this;
	};

	add = (other) => {
		var a = this.elements;
		var b = other.elements;
		a[0] += b[0];
		a[1] += b[1];
		a[2] += b[2];
		a[3] += b[3];
		return this;
	};

	multiplyScalar = (s) => {
		var e = this.elements;
		e[0] *= s; 
		e[1] *= s; 
		e[2] *= s; 
		e[3] *= s;
		return this;
	};

	conjugate = () => {
		var e = this.elements;
		e[0] *= -1; 
		e[1] *= -1; 
		e[2] *= -1;
		return this;
	};

	get_imag = () => {
		return vec3(this.elements[0], this.elements[1], this.elements[2]);
	};

	get_real = () => {
		return this.elements[3];
	}

	sqr_norm = () => {
		var e = this.elements;
		return e[0] * e[0] + e[1] * e[1] + e[2] * e[2] + e[3] * e[3];
	}

	invert = () => {
		var sn = this.sqr_norm();
		var e = this.elements;
		e[0] /= -sn;
		e[1] /= -sn;
		e[2] /= -sn;
		e[3] /= sn;
		return this;
	}

	make_rot_angle_axis = (angle, vec) => {
		var e = this.elements;
		var sin_angle_half = Math.sin(angle * 0.5);
		var v = normalize(vec);
		e[0] = v[0] * sin_angle_half;
		e[1] = v[1] * sin_angle_half;
		e[2] = v[2] * sin_angle_half;
		e[3] = Math.cos(angle * 0.5);
		return this;
	}

	make_rot_vec2vec = (a, b) => {
		var e = this.elements;
		var tmp = Math.sqrt(2 * (1 + a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
		e[0] = (a[1] * b[2] - a[2] * b[1]) / tmp;
		e[1] = (a[2] * b[0] - a[0] * b[2]) / tmp;
		e[2] = (a[0] * b[1] - a[1] * b[0]) / tmp;
		e[3] = tmp / 2;
		return this;
	}

	get_mat3 = () => {
		var s = 2.0/Math.sqrt(this.sqr_norm());
		var e = this.elements;
		var qv_qv = vec3(e[0]*e[0], e[1]*e[1], e[2]*e[2]);
		var qv_qw = vec3(e[0]*e[3], e[1]*e[3], e[2]*e[3]);
	
		var R = mat3(
			1 - s * (qv_qv[1] + qv_qv[2]), s * (e[0] * e[1] - qv_qw[2]), s * (e[0] * e[2] + qv_qw[1]),
			s * (e[0] * e[1] + qv_qw[2]), 1 - s * (qv_qv[0] + qv_qv[2]), s * (e[1] * e[2] - qv_qw[0]),
			s * (e[0] * e[2] - qv_qw[1]), s * (e[1] * e[2] + qv_qw[0]), 1 - s * (qv_qv[0] + qv_qv[1])
		);
		return R;
	}

	get_mat4 = () => {
		var s = 2.0/Math.sqrt(this.sqr_norm());
		var e = this.elements;
		var qv_qv = vec3(e[0] * e[0], e[1] * e[1], e[2] * e[2]);
		var qv_qw = vec3(e[0] * e[3], e[1] * e[3], e[2] * e[3]);
		var R = mat4(
			1 - s * (qv_qv[1] + qv_qv[2]), s * (e[0] * e[1] - qv_qw[2]), s * (e[0] * e[2] + qv_qw[1]), 0,
			s * (e[0] * e[1] + qv_qw[2]), 1 - s * (qv_qv[0] + qv_qv[2]), s * (e[1] * e[2] - qv_qw[0]), 0,
			s * (e[0] * e[2] - qv_qw[1]), s * (e[1] * e[2] + qv_qw[0]), 1 - s * (qv_qv[0] + qv_qv[1]), 0,
			0, 0, 0, 1
		);
		return R;
	}
};
