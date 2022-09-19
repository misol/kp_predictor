/* Javascript file (calculations) - Tissue-to-plasma partition coefficient */
console.log('Kp predictor');
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" &&
	isFinite(value) &&
	Math.floor(value) === value;
};
if (!Number.MAX_SAFE_INTEGER) {
	Number.MAX_SAFE_INTEGER = 9007199254740991; // Math.pow(2, 53) - 1;
}
Number.isSafeInteger = Number.isSafeInteger || function (value) {
   return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
};
if (!Object.entries) {
  Object.entries = function( obj ){
	var ownProps = Object.keys( obj ),
		i = ownProps.length,
		resArray = new Array(i); // preallocate the Array
	while (i--)
	  resArray[i] = [ownProps[i], obj[ownProps[i]]];

	return resArray;
  };
}

$(document).on({
	ajaxStart: function() {
		$('html').css("cursor", "wait");
		displayLoading ('Waiting for the server response...');
	},
	ajaxStop: function() {
		$('html').css("cursor", "auto");
		hideLoading ();
	}
});

function displayLoading ( inner_html ) {
	inner_html = (typeof inner_html !== 'undefined') ?  inner_html : null;
	
	if (inner_html == null) {
		$("#progress_layer").html('');
		$("body").addClass("loading");
	} else {
		$("#progress_layer").html(inner_html);
	}
}
function hideLoading () {
	$("#progress_layer").html('');
	$("body").removeClass("loading");
}
/*
 * @ brief: Round number in the designated significant number.
 * @ param:
		number a: the object number to be rounded;
		integer sig_figs: significant number.
 * @ return: number
*/
function float_to_sig(a, sig_figs) {
	sig_figs = (typeof sig_figs !== 'undefined') ?  sig_figs : 3;
	
	return Number.parseFloat(a).toPrecision(sig_figs);
}

const Body_weight = {
	"mouse": 0.025,
	"rat": 0.25,
	"monkey": 5,
	"human_male": 65 // 70 kg for males and 58 kg for females. (Brown et al)
}
Object.freeze(Body_weight);

const Cardiac_output = {
	"rat": 80, // mL/min
	"monkey": 1086, // mL/min  ref: Davis and Morris 1993 https://doi.org/10.1023/A:1018943613122
	"human_male": 6471 // mL/min 32 yr [-6.846*LOG10(Age)+16.775 (L/min)]
};
Object.freeze(Cardiac_output);


// Physiological properties 
// UNITS
// volume: mL
// time: min
const Tissue_dictionary = {
	"mouse": { // PK-Sim mouse
		"Plasma": {
			'key': "p",
			'type': 'blood',
			'volume': 0.896,
			'blood_flow': 6.51,
			'hematocrit': 0.45
			},
		
		"Artery": {
			'key': "ar",
			'type': 'blood',
			'volume': 0.896/3,
			'blood_flow': 6.51
			},
		"Vein": {
			'key': "ve",
			'type': 'blood',
			'volume': 0.896*2/3,
			'blood_flow': 6.51
			},
		
		"Lung": {
			'key': "G",
			'type': 've-to-ar_tissue',
			'volume': 0.119,
			'vascular_volume': null,
			'blood_flow': 6.51,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Kidney": {
			'key': "K",
			'type': 'ar-to-ve_tissue',
			'volume': 0.405,
			'vascular_volume': null,
			'blood_flow': 1.55,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Heart": {
			'key': "H",
			'type': 'ar-to-ve_tissue',
			'volume': 0.113,
			'vascular_volume': null,
			'blood_flow': 0.333,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Liver": {
			'key': "L",
			'type': 'ar-to-ve_tissue',
			'volume': 1.55,
			'vascular_volume': null,
			'blood_flow': 0.416,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Gut": {
			'key': "I",
			'type': 'ar-to-ve_tissue',
			'volume': 1.67,
			'vascular_volume': null,
			'blood_flow': 1.19,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Adipose": {
			'key': "A",
			'type': 'ar-to-ve_tissue',
			'volume': 1.19,
			'vascular_volume': null,
			'blood_flow': 0.0476,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Bone": {
			'key': "Bo",
			'type': 'ar-to-ve_tissue',
			'volume': 1.88,
			'vascular_volume': null,
			'blood_flow': 0.800,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Muscle": {
			'key': "M",
			'type': 'ar-to-ve_tissue',
			'volume': 10,
			'vascular_volume': null,
			'blood_flow': 1.08,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Brain": {
			'key': "B",
			'type': 'ar-to-ve_tissue',
			'volume': 0.202,
			'vascular_volume': null,
			'blood_flow': 0.155,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Spleen": {
			'key': "S",
			'type': 'ar-to-ve_tissue',
			'volume': 0.119,
			'vascular_volume': null,
			'blood_flow': 0.107,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Skin": {
			'key': "Sk",
			'type': 'ar-to-ve_tissue',
			'volume': 3.45,
			'vascular_volume': null,
			'blood_flow': 0.488,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			}
		},
	"rat": {
		"Plasma": {
			'key': "p",
			'type': 'blood',
			'volume': 15.32,
			'blood_flow': 80,
			'hematocrit': 0.439
			},
		
		"Artery": {
			'key': "ar",
			'type': 'blood',
			'volume': 15.32/3,
			'blood_flow': 80
			},
		"Vein": {
			'key': "ve",
			'type': 'blood',
			'volume': 15.32*2/3,
			'blood_flow': 80
			},
		
		"Lung": {
			'key': "G",
			'type': 've-to-ar_tissue',
			'volume': 1.24,
			'vascular_volume': 0.259,
			'blood_flow': 80,
			'surface_area': {
				'model1': 144000,
				'model2': 144000
				}
			},
		"Kidney": {
			'key': "K",
			'type': 'ar-to-ve_tissue',
			'volume': 2.19,
			'vascular_volume': 0.541,
			'blood_flow': 80*14.5/100,
			'surface_area': {
				'model1': 374000,
				'model2': 397000
				}
			},
		"Heart": {
			'key': "H",
			'type': 'ar-to-ve_tissue',
			'volume': 1.05,
			'vascular_volume': 0.342,
			'blood_flow': 80*4/100,
			'surface_area': {
				'model1': 181000,
				'model2': 190000
				}
			},
		"Liver": {
			'key': "L",
			'type': 'ar-to-ve_tissue',
			'volume': 8.57,
			'vascular_volume': 1.8,
			'blood_flow': 80*24.2/100,
			'surface_area': {
				'model1': 148000,
				'model2': 156000
				}
			},
		"Gut": {
			'key': "I",
			'type': 'ar-to-ve_tissue',
			'volume': 6.19,
			'vascular_volume': 0.433,
			'blood_flow': 80*10.1/100,
			'surface_area': {
				'model1': 161000,
				'model2': 179000
				}
			},
		"Adipose": {
			'key': "A",
			'type': 'ar-to-ve_tissue',
			'volume': 16.66,
			'vascular_volume': 0.025,
			'blood_flow': 80*5.9/100,
			'surface_area': {
				'model1': 30200,
				'model2': 33000
				}
			},
		"Bone": {
			'key': "Bo",
			'type': 'ar-to-ve_tissue',
			'volume': 15.7,
			'vascular_volume': 0.195,
			'blood_flow': 80*10.1/100,
			'surface_area': {
				'model1': 23400,
				'model2': 24300
				}
			},
		"Muscle": {
			'key': "M",
			'type': 'ar-to-ve_tissue',
			'volume': 116.13,
			'vascular_volume': 1.36,
			'blood_flow': 80*23.7/100,
			'surface_area': {
				'model1': 57100,
				'model2': 77000
				}
			},
		"Brain": {
			'key': "B",
			'type': 'ar-to-ve_tissue',
			'volume': 1.24,
			'vascular_volume': 0.0165,
			'blood_flow': 80*1.4/100,
			'surface_area': {
				'model1': 16700,
				'model2': 17000
				}
			},
		"Spleen": {
			'key': "S",
			'type': 'ar-to-ve_tissue',
			'volume': 0.57,
			'vascular_volume': 0.0126,
			'blood_flow': 80*1.1/100,
			'surface_area': {
				'model1': 45600,
				'model2': 46800
				}
			},
		"Skin": {
			'key': "Sk",
			'type': 'ar-to-ve_tissue',
			'volume': 39.4,
			'vascular_volume': 0.269,
			'blood_flow': 80*5.1/100,
			'surface_area': {
				'model1': 8430,
				'model2': 9020
				}
			}
		},
		
	"monkey": {
		"Plasma": {
			'key': "p",
			'type': 'blood',
			'volume': Body_weight['monkey'] * 1000 * 6.59 / 100,
			'blood_flow': Cardiac_output["monkey"],
			'hematocrit': 0.35 // https://onlinelibrary.wiley.com/doi/10.1111/j.1399-3089.2012.00713.x
			},
		
		"Artery": {
			'key': "ar",
			'type': 'blood',
			'volume': Body_weight['monkey'] * 1000 * 6.59 / 100 /3,
			'blood_flow': Cardiac_output["monkey"]
			},
		"Vein": {
			'key': "ve",
			'type': 'blood',
			'volume': Body_weight['monkey'] * 1000 * 6.59 / 100 * 2/3,
			'blood_flow': Cardiac_output["monkey"]
			},
		
		"Lung": {
			'key': "G",
			'type': 've-to-ar_tissue',
			'volume': Body_weight['monkey'] * 1000 * 0.49 / 100 / 1.051,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"],
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Kidney": {
			'key': "K",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 0.4 / 100 / 1.050,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 12.707 / 100, //https://doi.org/10.1016/S0022-5223(19)42198-3
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Heart": {
			'key': "H",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 0.36 / 100 / 1.030,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 5.525 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Liver": {
			'key': "L",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 1.97 / 100 / 1.065,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 28.821 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Gut": {
			'key': "I",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 4.72 / 100 / 1.082,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 11.510 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Adipose": {
			'key': "A",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 9.18 / 100 / 0.916,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 1.842 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Bone": {
			'key': "Bo",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 20.3 / 100 / 5.062,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 5.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Muscle": {
			'key': "M",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 40.89 / 100 / 1.041,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 8.287 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Brain": {
			'key': "B",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 2.12 / 100 / 1.036,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 6.630 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Spleen": {
			'key': "S",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 0.21 / 100 / 1.054,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 1.934 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Skin": {
			'key': "Sk",
			'type': 'ar-to-ve_tissue',
			'volume': Body_weight['monkey'] * 1000 * 8.49 / 100 / 1.123,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["monkey"] * 4.972 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			}
		},

	"human_male": { // males
		"Plasma": {
			'key': "p",
			'type': 'blood',
			'volume': 5455, // blood volume
			'blood_flow': Cardiac_output["human_male"],
			'hematocrit': 0.45
			},
		
		"Artery": {
			'key': "ar",
			'type': 'blood',
			'volume': 5455/3,
			'blood_flow': Cardiac_output["human_male"]
			},
		"Vein": {
			'key': "ve",
			'type': 'blood',
			'volume': 5455*2/3,
			'blood_flow': Cardiac_output["human_male"]
			},
		
		"Lung": {
			'key': "G",
			'type': 've-to-ar_tissue',
			'volume': 506.4,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"],
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Kidney": {
			'key': "K",
			'type': 'ar-to-ve_tissue',
			'volume': 293.3,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 19.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Heart": {
			'key': "H",
			'type': 'ar-to-ve_tissue',
			'volume': 319.4,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 4.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Liver": {
			'key': "L",
			'type': 'ar-to-ve_tissue',
			'volume': 1689,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 25.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Gut": {
			'key': "I",
			'type': 'ar-to-ve_tissue',
			'volume': 1106,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 17.1 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Adipose": {
			'key': "A",
			'type': 'ar-to-ve_tissue',
			'volume': 16370,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 5.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Bone": {
			'key': "Bo",
			'type': 'ar-to-ve_tissue',
			'volume': 5062,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 5.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Muscle": {
			'key': "M",
			'type': 'ar-to-ve_tissue',
			'volume': 26900,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 17.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Brain": {
			'key': "B",
			'type': 'ar-to-ve_tissue',
			'volume': 1352,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 12.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Spleen": {
			'key': "S",
			'type': 'ar-to-ve_tissue',
			'volume': 172.7,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 1.9 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			},
		"Skin": {
			'key': "Sk",
			'type': 'ar-to-ve_tissue',
			'volume': 2312,
			'vascular_volume': null,
			'blood_flow': Cardiac_output["human_male"] * 5.0 / 100,
			'surface_area': {
				'model1': null,
				'model2': null
				}
			}
		}
	}
Object.freeze(Tissue_dictionary);


// Default variables
// Micro-physiological properties
const Tissue_composition = {
	"rat": {
		// Rodgers, Leahy, and Rowland 2005; Rodgers and Rowland, 2006, 2007
		"Adipose": {
			"EW": 13.5, //%
			"IW": 1.7, //%
			"NL": 84.6, //% 85.3 = in the literature (85.3% will overflow 100%)
			"NP": 0.16, //%
			"AP": 0.4, // mg/g
			"KpALB": 0.049,
			"KpLPP": 0.068
		},
		"Bone": {
			"EW": 10, //%
			"IW": 34.6, //%
			"NL": 1.7, //%
			"NP": 0.17, //%
			"AP": 0.67, // mg/g
			"KpALB": 0.1,
			"KpLPP": 0.05
		},
		"Brain": {
			"EW": 16.2, //%
			"IW": 62, //%
			"NL": 3.9, //%
			"NP": 0.15, //%
			"AP": 0.4, // mg/g
			"KpALB": 0.048,
			"KpLPP": 0.041
		},
		"Gut": {
			"EW": 28.2, //%
			"IW": 47.5, //%
			"NL": 3.8, //%
			"NP": 1.25, //%
			"AP": 2.41, // mg/g
			"KpALB": 0.158,
			"KpLPP": 0.141
		},
		"Heart": {
			"EW": 32, //%
			"IW": 45.6, //%
			"NL": 1.4, //%
			"NP": 1.11, //%
			"AP": 2.25, // mg/g
			"KpALB": 0.157,
			"KpLPP": 0.16
		},
		"Kidney": {
			"EW": 27.3, //%
			"IW": 48.3, //%
			"NL": 1.2, //%
			"NP": 2.42, //%
			"AP": 5.03, // mg/g
			"KpALB": 0.13,
			"KpLPP": 0.137
		},
		"Liver": {
			"EW": 16.1, //%
			"IW": 57.3, //%
			"NL": 1.4, //%
			"NP": 2.4, //%
			"AP": 4.56, // mg/g
			"KpALB": 0.086,
			"KpLPP": 0.161
		},
		"Lung": {
			"EW": 33.6, //%
			"IW": 44.6, //%
			"NL": 2.2, //%
			"NP": 1.28, //%
			"AP": 3.91, // mg/g
			"KpALB": 0.212,
			"KpLPP": 0.168
		},
		"Muscle": {
			"EW": 11.8, //%
			"IW": 63, //%
			"NL": 1, //%
			"NP": 0.72, //%
			"AP": 1.53, // mg/g
			"KpALB": 0.064,
			"KpLPP": 0.059
		},
		"Skin": {
			"EW": 38.2, //%
			"IW": 29.1, //%
			"NL": 6, //%
			"NP": 0.44, //%
			"AP": 1.32, // mg/g
			"KpALB": 0.277,
			"KpLPP": 0.096
		},
		"Spleen": {
			"EW": 20.7, //%
			"IW": 57.9, //%
			"NL": 0.77, //%
			"NP": 1.13, //%
			"AP": 3.18, // mg/g
			"KpALB": 0.097,
			"KpLPP": 0.207
		},
		
		"RBC": { // Blood cells
			"EW": 0, //%
			"IW": 60.3, //%
			"NL": 0.17, //%
			"NP": 0.29, //%
			"AP": 0.5 // mg/g
		},
		"Plasma": {
			"EW": 0, //%
			"IW": 0, //%
			"NL": 0.23, //%
			"NP": 0.13, //%
			"AP": 0.057 // mg/g
		},
		"Pancreas": {
			"EW": 12, //%
			"IW": 66.4, //%
			"NL": 4.1, //%
			"NP": 0.93, //%
			"AP": 1.67, // mg/g
			"KpALB": 0.06,
			"KpLPP": 0.06
		},
		"Thymus": {
			"EW": 15, //%
			"IW": 62.6, //%
			"NL": 1.7, //%
			"NP": 0.92, //%
			"AP": 2.3, // mg/g
			"KpALB": 0.075,
			"KpLPP": 0.075
		},
	},
	"mouse": {
		// Rodgers, Leahy, and Rowland 2005; Rodgers and Rowland, 2006, 2007; Simcyp 2017 (FOR RESEARCH ONLY)
		"Adipose": {
			"EW": 7.3, //%
			"IW": 0.91, //%
			"NL": 84.6, //% 85.3 = in the literature (85.3% will overflow 100%)
			"NP": 0.16, //%
			"AP": 0.4, // mg/g
			"KpALB": 0.049,
			"KpLPP": 0.068
		},
		"Bone": {
			"EW": 11.2, //%
			"IW": 38.8, //%
			"NL": 1.70, //%
			"NP": 0.17, //%
			"AP": 0.67, // mg/g
			"KpALB": 0.1,
			"KpLPP": 0.05
		},
		"Brain": {
			"EW": 16.2, //%
			"IW": 62.1, //%
			"NL": 2.31, //%
			"NP": 3.41, //%
			"AP": 7.31, // mg/g
			"KpALB": 0.048,
			"KpLPP": 0.041
		},
		"Gut": {
			"EW": 28.8, //%
			"IW": 48.5, //%
			"NL": 3.24, //%
			"NP": 1.25, //%
			"AP": 2.41, // mg/g
			"KpALB": 0.158,
			"KpLPP": 0.141
		},
		"Heart": {
			"EW": 31.5, //%
			"IW": 44.9, //%
			"NL": 1.43, //%
			"NP": 1.14, //%
			"AP": 2.67, // mg/g
			"KpALB": 0.157,
			"KpLPP": 0.16
		},
		"Kidney": {
			"EW": 27.0, //%
			"IW": 47.7, //%
			"NL": 3.32, //%
			"NP": 1.82, //%
			"AP": 3.72, // mg/g
			"KpALB": 0.13,
			"KpLPP": 0.137
		},
		"Liver": {
			"EW": 17.4, //%
			"IW": 54.3, //%
			"NL": 3.24, //%
			"NP": 1.67, //%
			"AP": 3.30, // mg/g
			"KpALB": 0.086,
			"KpLPP": 0.161
		},
		"Lung": {
			"EW": 33.6, //%
			"IW": 44.6, //%
			"NL": 1.90, //%
			"NP": 1.35, //%
			"AP": 2.60, // mg/g
			"KpALB": 0.212,
			"KpLPP": 0.168
		},
		"Muscle": {
			"EW": 16.7, //%
			"IW": 56.0, //%
			"NL": 3.94, //%
			"NP": 2.92, //%
			"AP": 6.10, // mg/g
			"KpALB": 0.064,
			"KpLPP": 0.059
		},
		"Skin": {
			"EW": 39.7, //%
			"IW": 30.3, //%
			"NL": 3.16, //%
			"NP": 0.42, //%
			"AP": 2.12, // mg/g
			"KpALB": 0.277,
			"KpLPP": 0.096
		},
		"Spleen": {
			"EW": 18.6, //%
			"IW": 57.0, //%
			"NL": 1.20, //%
			"NP": 1.10, //%
			"AP": 2.11, // mg/g
			"KpALB": 0.097,
			"KpLPP": 0.207
		},
		
		"RBC": { // Blood cells
			"EW": 0, //%
			"IW": 66.0, //%
			"NL": 0.23, //%
			"NP": 0.34, //%
			"AP": 0.08 // mg/g
		},
		"Plasma": {
			"EW": 94.0, //%
			"IW": 0, //%
			"NL": 0.36, //%
			"NP": 0.22, //%
			"AP": 0.10 // mg/g
		}
	},
	"monkey": {
		"Adipose": {
			"EW": 14.1, //%
			"IW": 3.9, //%
			"NL": 33.9, //%
			"NP": 0.68, //%
			"AP": 0.26, // mg/g
			"KpALB": 0.021,
			"KpLPP": 0.068
		},
		"Bone": {
			"EW": 30.0, //%
			"IW": 31.0, //%
			"NL": 7.4, //%
			"NP": 0.11, //%
			"AP": 0.67, // mg/g
			"KpALB": 0.1,
			"KpLPP": 0.05
		},
		"Brain": {
			"EW": 21.6, //%
			"IW": 40.6, //%
			"NL": 2.22, //%
			"NP": 5.65, //%
			"AP": 1.29, // mg/g
			"KpALB": 0.048,
			"KpLPP": 0.041
		},
		"Gut": {
			"EW": 28.2, //%
			"IW": 47.5, //%
			"NL": 4.87, //%
			"NP": 1.63, //%
			"AP": 2.84, // mg/g
			"KpALB": 0.158,
			"KpLPP": 0.141
		},
		"Heart": {
			"EW": 19.7, //%
			"IW": 60.2, //%
			"NL": 1.15, //%
			"NP": 1.66, //%
			"AP": 3.07, // mg/g
			"KpALB": 0.157,
			"KpLPP": 0.16
		},
		"Kidney": {
			"EW": 30.8, //%
			"IW": 51.6, //%
			"NL": 2.07, //%
			"NP": 1.62, //%
			"AP": 2.48, // mg/g
			"KpALB": 0.13,
			"KpLPP": 0.137
		},
		"Liver": {
			"EW": 23.5, //%
			"IW": 52.7, //%
			"NL": 2.08, //%
			"NP": 1.54, //%
			"AP": 0.59, // mg/g
			"KpALB": 0.086,
			"KpLPP": 0.161
		},
		"Lung": {
			"EW": 45.6, //%
			"IW": 36.9, //%
			"NL": 1.44, //%
			"NP": 8.65, //%
			"AP": 2.53, // mg/g
			"KpALB": 0.212,
			"KpLPP": 0.168
		},
		"Muscle": {
			"EW": 12.7, //%
			"IW": 65.8, //%
			"NL": 0.239, //%
			"NP": 0.72, //%
			"AP": 2.49, // mg/g
			"KpALB": 0.025,
			"KpLPP": 0.059
		},
		"Skin": {
			"EW": 51.8, //%
			"IW": 11.0, //%
			"NL": 2.84, //%
			"NP": 1.11, //%
			"AP": 1.32, // mg/g
			"KpALB": 0.277,
			"KpLPP": 0.096
		},
		"Spleen": {
			"EW": 20.7, //%
			"IW": 57.9, //%
			"NL": 2.01, //%
			"NP": 1.98, //%
			"AP": 2.81, // mg/g
			"KpALB": 0.097,
			"KpLPP": 0.207
		},
		
		"RBC": { // Blood cells
			"EW": 0, //%
			"IW": 70.3, //%
			"NL": 0.17, //%
			"NP": 0.29, //%
			"AP": 0.44 // mg/g
		},
		"Plasma": {
			"EW": 94.5, //%
			"IW": 0, //%
			"NL": 0.260, //%
			"NP": 0.09, //%
			"AP": 0.004 // mg/g
		}
	},
	"human_male": {
		// Rodgers, Leahy, and Rowland 2005; Rodgers and Rowland, 2006, 2007; Simcyp
		"Adipose": {
			"EW": 14.1, //%
			"IW": 3.90, //%
			"NL": 79.0, //%
			"NP": 0.20, //%
			"AP": 0.4, // mg/g
			"KpALB": 0.021,
			"KpLPP": 0.068
		},
		"Bone": {
			"EW": 9.80, //%
			"IW": 34.1, //%
			"NL": 7.40, //%
			"NP": 0.11, //%
			"AP": 0.67, // mg/g
			"KpALB": 0.1,
			"KpLPP": 0.05
		},
		"Brain": {
			"EW": 9.20, //%
			"IW": 67.8, //%
			"NL": 5.10, //%
			"NP": 5.65, //%
			"AP": 0.4, // mg/g
			"KpALB": 0.048,
			"KpLPP": 0.041
		},
		"Gut": {
			"EW": 26.7, //%
			"IW": 45.1, //%
			"NL": 4.87, //%
			"NP": 1.63, //%
			"AP": 2.84, // mg/g
			"KpALB": 0.158,
			"KpLPP": 0.141
		},
		"Heart": {
			"EW": 31.3, //%
			"IW": 44.5, //%
			"NL": 1.15, //%
			"NP": 1.66, //%
			"AP": 3.07, // mg/g
			"KpALB": 0.157,
			"KpLPP": 0.16
		},
		"Kidney": {
			"EW": 28.3, //%
			"IW": 50.0, //%
			"NL": 2.07, //%
			"NP": 1.62, //%
			"AP": 2.48, // mg/g
			"KpALB": 0.13,
			"KpLPP": 0.137
		},
		"Liver": {
			"EW": 16.5, //%
			"IW": 58.6, //%
			"NL": 3.48, //%
			"NP": 2.52, //%
			"AP": 5.09, // mg/g
			"KpALB": 0.086,
			"KpLPP": 0.161
		},
		"Lung": {
			"EW": 34.8, //%
			"IW": 46.3, //%
			"NL": 0.3, //%
			"NP": 0.9, //%
			"AP": 0.5, // mg/g
			"KpALB": 0.212,
			"KpLPP": 0.168
		},
		"Muscle": {
			"EW": 9.1, //%
			"IW": 66.9, //%
			"NL": 2.38, //%
			"NP": 0.72, //%
			"AP": 2.49, // mg/g
			"KpALB": 0.025,
			"KpLPP": 0.059
		},
		"Skin": {
			"EW": 62.3, //%
			"IW": 9.47, //%
			"NL": 2.84,  //%
			"NP": 1.11, //%
			"AP": 1.32, // mg/g
			"KpALB": 0.277,
			"KpLPP": 0.096
		},
		"Spleen": {
			"EW": 20.8, //%
			"IW": 58.0, //%
			"NL": 2.01, //%
			"NP": 1.98, //%
			"AP": 2.81, // mg/g
			"KpALB": 0.097,
			"KpLPP": 0.207
		},
		
		"RBC": { // Blood cells
			"EW": 0, //%
			"IW": 66.6, //%
			"NL": 0.17, //%
			"NP": 0.29, //%
			"AP": 0.44 // mg/g
		},
		"Plasma": {
			"EW": 94.5, //%
			"IW": 0, //%
			"NL": 0.35, //%
			"NP": 0.225, //%
			"AP": 0.04 // mg/g
		},
		"Pancreas": {
			"EW": 12, //%
			"IW": 66.4, //%
			"NL": 4.1, //%
			"NP": 0.93, //%
			"AP": 1.67, // mg/g
			"KpALB": 0.06,
			"KpLPP": 0.06
		},
	},
};
Object.freeze(Tissue_composition);

const Component_pH = {
	"mouse": {
		"Plasma": 7.28,
		"EW": 7.4,
		"IW": 7.33,
		"IW_RBC": 7.22,
		"Brain mass": 7.12,
		"CSF": 7.33
	},
	"rat": {
		"Plasma": 7.4,
		"EW": 7.4,
		"IW": 6.9,
		"IW_RBC": 7.27,
		"Brain mass": 7.12,
		"CSF": 7.33
	},
	"monkey": {
		"Plasma": 7.4, // https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5447977/
		"EW": 7.4,
		"IW": 7,
		"IW_RBC": 7.22,
		"Gut_ISF": 7.23,
		"Pulmonary_fluid": 6.6,
		"Brain_ISF": 7.31,
		"Brain_ICF": 7.01,
		"CSF": 7.31
	},
	"human_male": {
		"Plasma": 7.4,
		"EW": 7.4,
		"IW": 7,
		"IW_RBC": 7.22,
		"Gut_ISF": 7.23,
		"Pulmonary_fluid": 6.6,
		"Brain_ISF": 7.31,
		"Brain_ICF": 7.01,
		"CSF": 7.31
	},
}
Object.freeze(Component_pH);


var _variables = {}
function get (name) {
	if (typeof name !== "string") {
		return false;
	}
	
	try {
		return _variables[name];
	} catch (error) {
		console.error(error);
		alert("Kp predictor error: Variable could not be obtained\n" + " - " + String(name));
		return null;
	}
}


function set (name, value) {
	if (typeof name !== "string" || typeof value === "undefined") {
		return false;
	}
	
	try {
		_variables[name] = value;
		if (name === "units") {
			$(".unit_time").html(_variables[name]['time']);
			$(".unit_weight").html(_variables[name]['weight']);
			$(".unit_volume").html(_variables[name]['volume']);
		}
		return true;
	} catch (error) {
		console.error(error);
		alert("Kp predictor error: Variable could not be defined\n" + " - " + String(name));
		return false;
	}
}

function getElementFloat( name ) {
	var output = Number($( name ).val());
	if(procValidate(name, output, "floating") ) {
		return output
	} else {
		return false;
	}
}

/*
 * @ brief: filter the values, and popup if the rule and value were not matched.
 * @ return: boolen
*/
function procValidate(name, value, rule) {
	if (typeof name !== "string" || typeof value === "undefined" || value === null || typeof rule === "undefined" || rule === null) {
		return false;
	}
	
	if(!is_it (rule, value)) {
		alert('Check the type of parameter: ' + name);
	} else {
		return true;
	}
	return false
}

/*
 * @ brief: filter the values
 * @ return: boolen
*/
function is_it (rule, value) {
	if (typeof value === "undefined" || value === null || typeof rule === "undefined" || rule === null) {
		return false;
	}
	
	if (typeof rule === "string") {
		switch (rule) {
			
			case 'numeric':
				return (is_it ('integer', value) || is_it ('floating', value));
				break;
				
			case 'positive':
				return (is_it ('numeric', value) && value > 0);
				break;
				
			case 'negative':
				return (is_it ('numeric', value) && value < 0);
				break;
				
			case 'positive+zero':
				return (is_it ('numeric', value) && value >= 0);
				break;
				
			case 'negative+zero':
				return (is_it ('numeric', value) && value <= 0);
				break;
				
			case 'integer':
				return (typeof value === "number" && Number.isSafeInteger(value));
				break;
				
			case 'floating':
				if (typeof value === "number" && !Number.isNaN(value)) {
					if (Number.parseFloat(value) == value) { 
						return true;
					}
				}
				return false;
				break;
			default:
				return false;
				break;
		}
		
	} else if (Array.isArray(rule)) {
		if ($.inArray( value, rule ) > -1) {
			// The value in the Array
			return true;
		} else {
			return false;
		}
	}
	return false;
}

const AvailableVars = {
	'units' : {
		'time': ['s', 'min', 'h', 'd', 'week'],
		'weight': ['pg', 'ng', 'ug', 'mg', 'g'],
		'volume': ['pL', 'nL', 'uL', 'mL', 'L']
	},
	'molecular_weight' : 'positive',
	'species' : ['mouse', 'rat', 'monkey', "human_male"],
	'molecular_type' : ['monoprotic_acid', 'monoprotic_base', 'diprotic_acid', 'diprotic_base', 'zwitterion', 'neutral'],
	
	'pKa' : 'positive',
	'fup' : 'positive',
	'RB' : 'positive',
	
	'Kp' : 'positive',
}
Object.freeze(AvailableVars);

function sort_object(obj) {
	items = Object.keys(obj).map(function(key) {
		return [key, obj[key]];
	});
	items.sort(function(first, second) {
		return second[1] - first[1];
	});
	sorted_obj={}
	$.each(items, function(k, v) {
		use_key = v[0]
		use_value = v[1]
		sorted_obj[use_key] = use_value
	})
	return(sorted_obj)
}


function unitConversion(value, unit_type, org_unit, target_unit) {
	var unit_types = ['amount', 'time', '1/time', 'volume', 'concentration'];
	if (unit_types.includes(unit_type) == false) {
		return;
	}
	org_unit = org_unit.replace('g', '1g').replace('L', '1L');
	target_unit = target_unit.replace('g', '1g').replace('L', '1L');
	
	var SI_prefixes = {
		'Y': 1e24,
		'Z': 1e21,
		'E': 1e18,
		'P': 1e15,
		'T': 1e12,
		'G': 1e9,
		'M': 1e6,
		'k': 1e3,
		'h': 1e2,
		'1': 1e0,
		'd': 1e-1,
		'c': 1e-2,
		'm': 1e-3,
		'u': 1e-6,
		'μ': 1e-6,
		'n': 1e-9,
		'p': 1e-12,
		'f': 1e-15,
		'a': 1e-18,
		'z': 1e-21,
		'y': 1e-24
	};
	
	var time_units_eq = {
		'sec': 604800,
		'min': 10080,
		'hour': 168,
		'day': 7,
		'week': 1
	};
	
	if (unit_type == 'time') {
		if ((org_unit in time_units_eq) && (target_unit in time_units_eq)) {
			return value * (time_units_eq[target_unit]/time_units_eq[org_unit]);
		}
	} else if (unit_type == '1/time') {
		if ((org_unit.replace("/","") in time_units_eq) && (target_unit.replace("/","") in time_units_eq)) {
			return value * (time_units_eq[org_unit]/time_units_eq[target_unit]);
		}
	} else if (unit_type == 'amount' || unit_type == 'volume') {
		if ((org_unit.slice(0, 1) in SI_prefixes) && (target_unit.slice(0, 1) in SI_prefixes)) {
			return value * (SI_prefixes[org_unit.slice(0, 1)]/SI_prefixes[target_unit.slice(0, 1)]);
		}
	} else if (unit_type == 'concentration') {
		var org_unit = org_unit.split("/");
		var target_unit = target_unit.split("/");
		
		if ((org_unit[0].slice(0, 1) in SI_prefixes) && (org_unit[1].slice(0, 1) in SI_prefixes) && (target_unit[0].slice(0, 1) in SI_prefixes) && (target_unit[1].slice(0, 1) in SI_prefixes)) {
			return value * (SI_prefixes[org_unit[0].slice(0, 1)]/SI_prefixes[target_unit[0].slice(0, 1)]) * (SI_prefixes[target_unit[1].slice(0, 1)]/SI_prefixes[org_unit[1].slice(0, 1)]);
		}
	}
	
	console.log('Unit conversion: unpredicted error.');
	return;
	
}


// Hansch equation
function getLogP_vegi() {
	var logPow = getlogP();
	var a = 1.115, b = -1.35;
	var logPvow = a * logPow + b;
	return logPvow;
}

function doPredictLogPvow () {
	var logPvow = getLogP_vegi();
	
	$("#logP_vegi").val(Number.parseFloat(logPvow).toFixed(4));
}

function getLogP_vegi_input() {
	return parseFloat($("#logP_vegi").val());
}


function __RR_method_XYZ (pH_p, pH_IW, pH_BC, pKa) {
	var X = null, Y = null, Z = null;
	var mol_type = get ("mol_type");
	
	if( mol_type === 'monoprotic_base' ) {
		// Bases
		pKa = parseFloat(pKa);
		
		X = Math.pow(10, pKa - pH_IW);
		Y = Math.pow(10, pKa - pH_p);
		Z = Math.pow(10, pKa - pH_BC);
	} else if( mol_type === 'diprotic_base' ) {
		// Diprotic base (pKa1<pKa2)
		pKa1 = parseFloat(pKa[0]);
		pKa2 = parseFloat(pKa[1]);
		
		X = Math.pow(10, pKa2 - pH_IW) + Math.pow(10, pKa1 + pKa2 - 2 * pH_IW);
		Y = Math.pow(10, pKa2 - pH_p) + Math.pow(10, pKa1 + pKa2 - 2 * pH_p);
		Z = Math.pow(10, pKa2 - pH_BC) + Math.pow(10, pKa1 + pKa2 - 2 * pH_BC);
		
	} else if( mol_type === 'monoprotic_acid' ) {
		// Monoprotic acid
		pKa = Number(pKa);
		
		X = Math.pow(10, pH_IW - pKa);
		Y = Math.pow(10, pH_p - pKa);
		Z = null;
		
	} else if( mol_type === 'diprotic_acid' ) {
		// Diprotic acid (pKa1<pKa2)
		pKa1 = parseFloat(pKa[0]);
		pKa2 = parseFloat(pKa[1]);
		
		X = Math.pow(10, pH_IW - pKa1) + Math.pow(10, 2 * pH_IW - pKa1 - pKa2);
		Y = Math.pow(10, pH_p - pKa1) + Math.pow(10, 2 * pH_p - pKa1 - pKa2);
		Z = null;
		
	} else if( mol_type === 'zwitterion' ) {
		// Zwitterions
		pKa_acid = parseFloat(pKa['acid']);
		pKa_base = parseFloat(pKa['base']);
		
		X = Math.pow(10, pKa_base - pH_IW) + Math.pow(10, pH_IW - pKa_acid);
		Y = Math.pow(10, pKa_base - pH_p) + Math.pow(10, pH_p - pKa_acid);
		Z = Math.pow(10, pKa_base - pH_BC) + Math.pow(10, pH_BC - pKa_acid);
		
	} else if( mol_type === 'neutral' ) {
		// Neutral
		X = 0;
		Y = 0;
		Z = null;
		
	} else {
		return null;
	}
	return [X, Y, Z];
}

// Rodgers and Rowland methods
function RR_method() {
	var species = get ("species");
	//['monoprotic_acid', 'monoprotic_base', 'diprotic_acid', 'diprotic_base', 'zwitterion', 'neutral'],
	var mol_type = get ("mol_type");
	var pH_dict = Component_pH[species];
	var fup = get ("fup"), RB = get("RB"), Kpu = null;
	var pKa = 0, pKa1 = 0, pKa2 = 0, pKa_acid = 0, pKa_base = 0;
	var pKa_array = null;
	
	if( mol_type === 'monoprotic_base' ) {
		// Bases
		pKa = parseFloat($("#pKa").val());
		pKa_array = pKa;
	} else if( mol_type === 'diprotic_base' ) {
		// Diprotic base (pKa1<pKa2)
		pKa1 = parseFloat($("#pKa_1").val());
		pKa2 = parseFloat($("#pKa_2").val());
		if (pKa1 > pKa2) {
			var pKa_temp = [pKa1, pKa2];
			pKa1 = pKa_temp[1];
			pKa2 = pKa_temp[0];
		}
		pKa_array = [pKa1, pKa2];
	} else if( mol_type === 'monoprotic_acid' ) {
		// Monoprotic acid
		pKa = Number($("#pKa").val());
		pKa_array = pKa;
	} else if( mol_type === 'diprotic_acid' ) {
		// Diprotic acid (pKa1<pKa2)
		pKa1 = parseFloat($("#pKa_1").val());
		pKa2 = parseFloat($("#pKa_2").val());
		if (pKa1 > pKa2) {
			var pKa_temp = [pKa1, pKa2];
			pKa1 = pKa_temp[1];
			pKa2 = pKa_temp[0];
		}
		pKa_array = [pKa1, pKa2];
	} else if( mol_type === 'zwitterion' ) {
		// Zwitterions
		pKa_acid = parseFloat($("#pKa_acid").val());
		pKa_base = parseFloat($("#pKa_base").val());
		pKa_array = {'acid': pKa_acid, 'base':pKa_base};
		
	} else if( mol_type === 'neutral' ) {
	} else {
		return null;
	}
	
	//
	var tissue_comp = Tissue_composition[species];
	
	var hematocrit = Tissue_dictionary[species]['Plasma']['hematocrit'];
	var Kpu = {};
	var Kp = {};
	for (const [key, value] of Object.entries(Tissue_dictionary[species])) {
		if (value['type'] !== 'blood') {
			var Abb_tissue = value['key'];
			var P = 0;
			// Kp key log.
			if (key === "Adipose") {
				P = Math.pow(10, getLogP_vegi_input());
			} else {
				P = Math.pow(10, getlogP());
			}
			if (("tissues" in pH_dict) && (Abb_tissue in pH_dict["tissues"])) {
				pH_IW = pH_dict["tissues"][Abb_tissue];
			} else {
				pH_IW = pH_dict["IW"];
			}
			
			var XYZ = __RR_method_XYZ (pH_dict["Plasma"], pH_IW, pH_dict["IW_RBC"], pKa_array);
			var X = XYZ[0], Y = XYZ[1], Z = XYZ[2];
			
			var f_EW = tissue_comp[key]['EW']/100, f_IW = tissue_comp[key]['IW']/100, f_NL = tissue_comp[key]['NL']/100, f_NP = tissue_comp[key]['NP']/100, AP_T = tissue_comp[key]['AP'];
			var f_IWBC = tissue_comp['RBC']['IW']/100, f_NLBC = tissue_comp['RBC']['NL']/100, f_NPBC = tissue_comp['RBC']['NP']/100, AP_BC = tissue_comp['RBC']['AP'];
			var f_NLP = tissue_comp['Plasma']['NL']/100, f_NPP = tissue_comp['Plasma']['NP']/100;
			
			
			if (( mol_type === 'monoprotic_base' || mol_type === 'diprotic_base' ) && (pKa >= 7 || pKa2 >= 7 || pKa_base >=7) ) {
				// moderate-to-strong bases
				var Kpu_BC = (hematocrit - 1 + RB)/ ( fup * hematocrit);
				var Ka_AP = (Kpu_BC - ( (1+Z)/(1+Y) * f_IWBC ) - ( P * f_NLBC + ( 0.3 * P + 0.7 ) * f_NPBC ) / (1 + Y)) * ( (1 + Y) / ( AP_BC * Z) );
				
				Kpu[Abb_tissue] = (((1 + X) * f_IW) / (1 + Y)) + f_EW + ( (Ka_AP * AP_T * X) / (1 + Y) ) + ( (P * f_NL + (0.3 * P + 0.7) * f_NP) / (1 + Y) );
			} else {
			// acids, very weak bases, neutrals and zwitterions
				var KpPR = 0;
				if ( mol_type === 'neutral' ) {
					// lipoprotein
					KpPR = tissue_comp[key]['KpLPP'];
				} else {
					KpPR = tissue_comp[key]['KpALB'];
				}
				
				var Ka_PR_KpPR = (1/fup - 1 - (P * f_NLP + ( 0.3 * P + 0.7 ) * f_NPP)/(1+Y) ) * KpPR;
				Kpu[Abb_tissue] = (((1 + X) * f_IW) / (1 + Y)) + f_EW + ( Ka_PR_KpPR ) + ( (P * f_NL + (0.3 * P + 0.7) * f_NP) / (1 + Y) );
			}
			Kp[Abb_tissue] = Kpu[Abb_tissue] * fup;
		}
	}
	
	return Kp;
}

function loadKp() {
	set ("Kp", RR_method());
	return true;
}


function loadValues () {
	var mol_type = $("#mol_type option:selected").val(),
	
	fup = Number($("#fup").val()),
	RB = Number($("#RB").val()),
	species = String($("#species option:selected").val());

	// common type check
	if ( !procValidate('Acid/base', mol_type, AvailableVars['molecular_type'])
		
		|| !procValidate('fup', fup, AvailableVars['fup'])
		|| !procValidate('Blood-to-plasma ratio', RB, AvailableVars['RB'])
		|| !procValidate('Species', species, AvailableVars['species'])
		
	) {
		return false;
	}
	
	
	if(fup < 0.000001 || fup > 1) {
		alert('fup should be within the range from 0.000001 to 1.');
		return false;
	}
	if(RB < 0.000001 || RB > 1000) {
		alert('Blood-to-plasma partition coefficient should be within the range from 0.000001 to 100.');
		return false;
	}
	
	set ("species", species);
	set ("BW", Body_weight[get ("species")]); //kg
	
	
	set ("mol_type", mol_type);
	
	set ("fup", fup);
	set ("RB", RB);
	
	var temp_dict = Tissue_dictionary[get ("species")];
	
	set ("V", {
		'p': temp_dict['Plasma']['volume'],
		'ar': temp_dict['Artery']['volume'],
		've': temp_dict['Vein']['volume'],
		
		'G': temp_dict['Lung']['volume'],
		
		'A': temp_dict['Adipose']['volume'],
		'Bo': temp_dict['Bone']['volume'],
		'B': temp_dict['Brain']['volume'],
		'I': temp_dict['Gut']['volume'],
		'H': temp_dict['Heart']['volume'],
		'K': temp_dict['Kidney']['volume'],
		'L': temp_dict['Liver']['volume'],
		'M': temp_dict['Muscle']['volume'],
		'Sk': temp_dict['Skin']['volume'],
		'S': temp_dict['Spleen']['volume']
	});
	
	
	var tissue_names = {}
	for (const [tissue_name_i, tissue_item_i] of Object.entries(Tissue_dictionary[get ("species")])) {
		tissue_names[tissue_item_i['key']] = tissue_name_i;
	}
	set ('tissue_names', tissue_names);
	
	loadKp();
	return true;
}

function getVss () {
	var tissues = ['G', 'A', 'Bo', 'B', 'H', 'K', 'L', 'M', 'Sk', 'S', 'I'];
	var V = get("V"), RB = get("RB"), Kp = JSON.parse(JSON.stringify(get("Kp")));
	
	var Vss = V["p"];
	tissues.forEach(function(element){
		Vss =  Vss + V[element] * Kp[element] / RB;
	});
	return Vss;
}


function getlogP() {
	return parseFloat($("#logP").val());
}


function doCalculation () {
	displayLoading ();
	
	displayLoading ( 'Initializing...' );
	$('#results_Kp').html('');
	
	displayLoading ( 'Loading input values...' );
	if(loadValues ()) {
		displayLoading ( 'Make a table...' );
		
		dispKp ();
		hideLoading ();
	} else {
		alert('return false');
		hideLoading ();
	}
	return false;
}


function dispKp () {
	var tissue_names = get('tissue_names'), Kp = JSON.parse(JSON.stringify(get("Kp"))), Vss = getVss (), RB = get('RB'), BW = get('BW');
	var temp_html = '<table id="disp_Kp" class="result_table">';
	
	for (const [key, value] of Object.entries(Tissue_dictionary[get("species")])) {
		if (value['type'] !== 'blood') {
			var Abb_tissue = value['key'];
			
			temp_html = temp_html + '<tr>';
			temp_html = temp_html + '<td>' + tissue_names[Abb_tissue] + '</td>';
			temp_html = temp_html + '<td>' + float_to_sig(Kp[Abb_tissue], 4) + '</td>';
			temp_html = temp_html + '</tr>';
		}
	}
	temp_html = temp_html + '</table>';
	temp_html = temp_html + '<p>Vss: ' + float_to_sig(Vss * RB / BW, 4) + ' mL blood/kg</p>';
	
	$('#results_Kp').html(temp_html);
}

// Show/hide input boxes
function onload_settings () {
	
	//['monoprotic_acid', 'monoprotic_base', 'diprotic_acid', 'diprotic_base', 'zwitterion', 'neutral'],
	$("#mol_type").on( "change", function() {
		var mol_type = $("#mol_type option:selected").val();
		if (mol_type === 'monoprotic_acid' || mol_type === 'monoprotic_base') {
			// pKa
			$( "#control_pKa" ).slideDown( 400 );
			$( "#control_pKa_12" ).slideUp( 400 );
			$( "#control_pKa_acid_base" ).slideUp( 400 );
			
		} else if (mol_type === 'diprotic_acid' || mol_type === 'diprotic_base') {
			// pKa1, pKa2
			$( "#control_pKa" ).slideUp( 400 );
			$( "#control_pKa_12" ).slideDown( 400 );
			$( "#control_pKa_acid_base" ).slideUp( 400 );
		} else if (mol_type === 'zwitterion') {
			// pKa (acid, base)
			$( "#control_pKa" ).slideUp( 400 );
			$( "#control_pKa_12" ).slideUp( 400 );
			$( "#control_pKa_acid_base" ).slideDown( 400 );
		} else if (mol_type === 'neutral') {
			// pKa: none
			$( "#control_pKa" ).slideUp( 400 );
			$( "#control_pKa_12" ).slideUp( 400 );
			$( "#control_pKa_acid_base" ).slideUp( 400 );
		} else {
			// Error
		}
	} );
	$("#mol_type").trigger("change");
	

}

$(document).ready(function() {
	onload_settings ()
});