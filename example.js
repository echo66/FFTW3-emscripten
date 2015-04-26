function FFTWJS(size) {

	var fft_forward = Module.cwrap(
		'fft_forward', 'void', ['number', 'number', 'number', 'number']
	);

	var fft_inverse = Module.cwrap(
		'fft_inverse', 'void', ['number', 'number', 'number', 'number']
	);
	
	this.forward = function(inTimeData) {

		var size = inTimeData.length;
		var sizeHalf = ((size/2) + 1);
		var re = new Float64Array(sizeHalf);
		var im = new Float64Array(sizeHalf);

		// Get data byte size, allocate memory on Emscripten heap, and get pointer
		var nDataBytes    = sizeHalf * re.BYTES_PER_ELEMENT;
		var nDataBytes2   = size * inTimeData.BYTES_PER_ELEMENT;
		var ptr_re        = Module._malloc(nDataBytes);
		var ptr_im        = Module._malloc(nDataBytes);
		var ptr_tf        = Module._malloc(nDataBytes2);

		// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
		var heap_re = new Uint8Array(Module.HEAPU8.buffer, ptr_re, nDataBytes);
		heap_re.set(new Uint8Array(re.buffer));
		var heap_im = new Uint8Array(Module.HEAPU8.buffer, ptr_im, nDataBytes);
		heap_im.set(new Uint8Array(im.buffer));
		var heap_tf = new Uint8Array(Module.HEAPU8.buffer, ptr_tf, nDataBytes2);
		heap_tf.set(new Uint8Array(inTimeData.buffer));

		fft_forward(size, heap_tf.byteOffset, heap_re.byteOffset, heap_im.byteOffset);

		var res_re = new Float64Array(heap_re.buffer, heap_re.byteOffset, re.length);
		var res_im = new Float64Array(heap_im.buffer, heap_im.byteOffset, im.length);

		Module._free(ptr_re);
		Module._free(ptr_im);
		Module._free(ptr_tf);

		return [
			new Float64Array(res_re),   // IT IS A HACK!
			new Float64Array(res_im)    // IT IS A HACK!
		];
	}

	this.inverse = function(inRealData, inImagData) {

		var outTimeData = new Float64Array(inRealData.length * 2 - 2);
		var size = outTimeData.length;
		var sizeHalf = ((size/2) + 1);
		// var re = new Float64Array(sizeHalf);
		// var im = new Float64Array(sizeHalf);

		// Get data byte size, allocate memory on Emscripten heap, and get pointer
		var nDataBytes    = sizeHalf * inRealData.BYTES_PER_ELEMENT;
		var nDataBytes2   = size * outTimeData.BYTES_PER_ELEMENT;
		var ptr_re        = Module._malloc(nDataBytes);
		var ptr_im        = Module._malloc(nDataBytes);
		var ptr_tf        = Module._malloc(nDataBytes2);

		// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
		var heap_re = new Uint8Array(Module.HEAPU8.buffer, ptr_re, nDataBytes);
		heap_re.set(new Uint8Array(inRealData.buffer));
		var heap_im = new Uint8Array(Module.HEAPU8.buffer, ptr_im, nDataBytes);
		heap_im.set(new Uint8Array(inImagData.buffer));
		var heap_tf = new Uint8Array(Module.HEAPU8.buffer, ptr_tf, nDataBytes2);
		heap_tf.set(new Uint8Array(outTimeData.buffer));

		fft_inverse(size, heap_re.byteOffset, heap_im.byteOffset, heap_tf.byteOffset);

		var res_time = new Float64Array(heap_tf.buffer, heap_tf.byteOffset, outTimeData.length);

		Module._free(ptr_re);
		Module._free(ptr_im);
		Module._free(ptr_tf);

		return res_time;
	}
}