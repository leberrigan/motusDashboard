

var antennaShapes = {};

function getAntennaShape({
	lat = false,
  lon = false,
  antennaType = "fake",
  bearing = false,
  referenceIsotropicRange = 1000, // in meters
  omniRange = 1.640923, // relative to an isotropic radiator
  yagi5Pattern = [10.21716, 10.20632, 10.17385, 10.11995, 10.04491, 9.949187, 9.833309, 9.697941, 9.543848, 9.371896, 9.183044, 8.978338, 8.758897, 8.525911, 8.280626, 8.024336, 7.758373, 7.484096, 7.20288, 6.916108, 6.625157, 6.331388, 6.036141, 5.740719, 5.446385, 5.154347, 4.865757, 4.5817, 4.303189, 4.031159, 3.766463, 3.509867, 3.262052, 3.023604, 2.79502, 2.576707, 2.36898, 2.172065, 1.986102, 1.811149, 1.647185, 1.494113, 1.351769, 1.219924, 1.09829, 0.9865295, 0.884259, 0.7910564, 0.706468, 0.6300145, 0.561198, 0.499508, 0.4444276, 0.3954391, 0.3520294, 0.313695, 0.2799462, 0.2503114, 0.2243404, 0.2016074, 0.1817132, 0.1642873, 0.1489891, 0.1355088, 0.1235675, 0.1129175, 0.1033414, 0.09465143, 0.08668791, 0.07931799, 0.0724337, 0.06594997, 0.05980247, 0.05394539, 0.04834908, 0.04299777, 0.03788722, 0.03302248, 0.02841578, 0.02408448, 0.02004916, 0.01633199, 0.01295516, 0.009939538, 0.007303602, 0.005062475, 0.003227222, 0.001804327, 0.0007953531, 0.0001967796, 0, 0.000191459, 0.0007529164, 0.001661815, 0.002891734, 0.00441291, 0.0061928, 0.008196681, 0.01038824, 0.01273021, 0.01518488, 0.01771473, 0.02028285, 0.02285348, 0.02539235, 0.02786703, 0.03024725, 0.03250506, 0.03461507, 0.0365545, 0.03830324, 0.03984392, 0.04116185, 0.042245, 0.04308391, 0.04367166, 0.04400372, 0.04407794, 0.04389441, 0.04345546, 0.04276556, 0.0418313, 0.04066142, 0.03926674, 0.03766024, 0.03585706, 0.03387456, 0.03173233, 0.02945227, 0.02705859, 0.02457784, 0.02203889, 0.01947289, 0.01691319, 0.01439523, 0.01195637, 0.009635649, 0.007473526, 0.00551155, 0.003791967, 0.002357284, 0.001249774, 0.0005109465, 0.0001809708, 0.0002980741, 0.0008979174, 0.002012962, 0.003671836, 0.005898717, 0.008712738, 0.01212744, 0.01615025, 0.02078207, 0.02601689, 0.03184152, 0.03823541, 0.04517054, 0.05261147, 0.06051549, 0.06883282, 0.07750703, 0.08647545, 0.09566984, 0.105017, 0.1144396, 0.1238569, 0.1331859, 0.1423424, 0.1512414, 0.159799, 0.1679329, 0.1755638, 0.1826162, 0.1890194, 0.1947086, 0.1996259, 0.2037206, 0.2069504, 0.2092819, 0.2106905, 0.2111617],
  yagi9Pattern = [19.54296, 19.51802, 19.44334, 19.31925, 19.1463, 18.92528, 18.65723, 18.34337, 17.98519, 17.58441, 17.14297, 16.66305, 16.14708, 15.59768, 15.01774, 14.41032, 13.77873, 13.12642, 12.45705, 11.7744, 11.08239, 10.38503, 9.68639, 8.990542, 8.301554, 7.623427, 6.960045, 6.31514, 5.692232, 5.094588, 4.525175, 3.986616, 3.481151, 3.010603, 2.576353, 2.179317, 1.819936, 1.498176, 1.213532, 0.9650477, 0.7513441, 0.5706536, 0.4208667, 0.299585, 0.2041802, 0.1318578, 0.07972364, 0.04485103, 0.02434638, 0.01541166, 0.01540144, 0.02187273, 0.0326263, 0.04573822, 0.05958091, 0.0728333, 0.08448036, 0.09380243, 0.1003555, 0.1039434, 0.1045844, 0.1024727, 0.09793823, 0.09140573, 0.08335514, 0.07428533, 0.06468219, 0.05499227, 0.04560269, 0.03682751, 0.02890057, 0.02197429, 0.01612369, 0.01135473, 0.007615686, 0.004810547, 0.00281314, 0.00148095, 0.0006677056, 0.0002340181, 5.55903e-05, 2.876977e-05, 7.344258e-05, 0.000133477, 0.0001750921, 0.0001836415, 0.000159365, 0.0001126662, 5.943554e-05, 1.685336e-05, 0, 1.947165e-05, 8.007435e-05, 0.0001805492, 0.0003141835, 0.0004700926, 0.0006349141, 0.0007946532, 0.0009364313, 0.001049942, 0.001128472, 0.001169422, 0.001174319, 0.001148391, 0.001099804, 0.001038704, 0.0009762131, 0.0009235214, 0.000891185, 0.0008887156, 0.0009244892, 0.001005961, 0.00114013, 0.001334161, 0.001596047, 0.001935201, 0.002362838, 0.002892079, 0.003537691, 0.004315439, 0.005241076, 0.006329016, 0.00759079, 0.009033401, 0.01065772, 0.01245709, 0.01441618, 0.01651041, 0.01870575, 0.02095921, 0.02321992, 0.0254307, 0.02753018, 0.02945534, 0.03114421, 0.03253884, 0.03358805, 0.03425015, 0.03449521, 0.03430693, 0.03368398, 0.03264062, 0.03120685, 0.02942772, 0.0273622, 0.02508137, 0.02266627, 0.02020529, 0.01779136, 0.01551903, 0.01348147, 0.01176764, 0.01045963, 0.009630275, 0.00934112, 0.009640806, 0.01056386, 0.01212994, 0.0143435, 0.01719392, 0.02065597, 0.02469062, 0.02924622, 0.03425983, 0.03965882, 0.04536256, 0.05128421, 0.05733258, 0.06341392, 0.06943374, 0.07529853, 0.08091737, 0.08620341, 0.09107531, 0.09545838, 0.09928577, 0.1024993, 0.1050504, 0.1069005, 0.1080218, 0.1083974]
} = {}) {

if (lat && lon) {
  if (antennaType === 'omni-mast' || antennaType === 'omni-whip' || antennaType === 'j-pole' || antennaType === 'monopole') {
    return createOmni(lat, lon, 1000);
  } else if (typeof parseInt(bearing) === 'number' && bearing >= 0 && bearing < 360) {
    if (antennaType === 'yagi-9-laird' || antennaType === 'yagi-9' || antennaType === 'yagi-9-maple' || antennaType === 'custom-9' || antennaType === 'yagi-8') {
//      return createYagi9(lat, lon, bearing);
      return createFake(lat, lon, bearing, 15000);
    } else if(antennaType === 'yagi-6' || antennaType === 'yagi-5' || antennaType === 'custom-6' || antennaType === 'yagi-4') {
  //    return createYagi5(lat, lon, bearing);
	      return createFake(lat, lon, bearing, 7500);
    } else {
      return createFake(lat, lon, bearing, 15000);
    }
  } else {
    return [lon, lat];
  }
} else {
  return [];
}

 function createOmni(lat, lon, range) {
  var TAU = 2 * Math.PI; // 360 degrees in radians
  var t = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  t = product(rotation(0, 1, 0, TAU * (90 - lat) / 360), t); // rotation along the meridian to the given latitude
  t = product(rotation(0, 0, 1, TAU * lon / 360), t); // rotation around the north pole to the given longitude

  var numSegments = 40;
  var z1 = 6371000; // mean radius of Earth in meters, from https://en.wikipedia.org/wiki/Earth
  var path = [];
  for(var i=0; i<TAU; i+=TAU/numSegments) {
   // Set up omnidirectional antenna coordinates at the north pole:
   var r = omniRange * (range?range:referenceIsotropicRange);
   var x1 = r * Math.cos(i);
   var y1 = r * Math.sin(i);
   // Apply the transform:
   var x2 = t[0][0] * x1 + t[0][1] * y1 + t[0][2] * z1;
   var y2 = t[1][0] * x1 + t[1][1] * y1 + t[1][2] * z1;
   var z2 = t[2][0] * x1 + t[2][1] * y1 + t[2][2] * z1;
   // Convert from Cartesian to lat/lon:
   var length = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
   var lat = (TAU/4 - Math.acos(z2 / length)) * 360 / TAU;
   var lon = Math.atan2(y2, x2) * 360 / TAU;
   while(lat < -90)
    lat += 180;
   while(lat > 90)
    lat -= 180;
   path.push([lon,lat]);
  }
  return path;
 }

 function createYagi9(lat, lon, bearing) { return createYagi(lat, lon, bearing, yagi9Pattern); }
 function createYagi5(lat, lon, bearing) { return createYagi(lat, lon, bearing, yagi5Pattern); }

 function createYagi(lat, lon, bearing, pattern) {
  var TAU = 2 * Math.PI; // 360 degrees in radians
  var t = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  t = product(rotation(0, 0, 1, TAU/2 - TAU * bearing / 360), t); // rotation around north pole to account for bearing
  t = product(rotation(0, 1, 0, TAU * (90 - lat) / 360), t); // rotation along the meridian to the given latitude
  t = product(rotation(0, 0, 1, TAU * lon / 360), t); // rotation around the north pole to the given longitude

  var numSegments = 200;
  var z1 = 6371000; // mean radius of Earth in meters, from https://en.wikipedia.org/wiki/Earth
  var path = [];
  for(var i=0; i<TAU; i+=TAU/numSegments) {
   // Set up yagi-uda antenna coordinates at the north pole:
   var deg = 360 * i / TAU;
   if(deg > 180)
    deg = 360 - deg;
   var floor = Math.floor(deg);
   var ceil = Math.ceil(deg);
   var gain = pattern[floor];
   if(ceil !== floor)
    gain += (pattern[ceil] - gain) * (deg - floor);
   var r = gain * referenceIsotropicRange;
   var x1 = r * Math.cos(i);
   var y1 = r * Math.sin(i);
   // Apply the transform:
   var x2 = t[0][0] * x1 + t[0][1] * y1 + t[0][2] * z1;
   var y2 = t[1][0] * x1 + t[1][1] * y1 + t[1][2] * z1;
   var z2 = t[2][0] * x1 + t[2][1] * y1 + t[2][2] * z1;
   // Convert from Cartesian to lat/lon:
   var length = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
   var lat = 360 * (TAU/4 - Math.acos(z2 / length)) / TAU;
   var lon = 360 * Math.atan2(y2, x2) / TAU;
   while(lat < -90)
    lat += 180;
   while(lat > 90)
    lat -= 180;
   path.push([lon,lat]);
  }
  return path;
 }

 function createFake(lat, lon, bearing, range) {
  // distances in meters
  var outerRadius = ( range ? range : 10000 );
  var innerRadius = outerRadius*(2 / 3);
  var width = outerRadius / 4;

  var TAU = 2 * Math.PI; // 360 degrees in radians
  var t = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  t = product(rotation(0, 0, 1, TAU/2 - TAU * bearing / 360), t); // rotation around north pole to account for bearing
  t = product(rotation(0, 1, 0, TAU * (90 - lat) / 360), t); // rotation along the meridian to the given latitude
  t = product(rotation(0, 0, 1, TAU * lon / 360), t); // rotation around the north pole to the given longitude

  var numSegments = 40;
  var z1 = 6371000; // mean radius of Earth in meters, from https://en.wikipedia.org/wiki/Earth
  var path = [];
  for(var i=0; i<TAU; i+=TAU/numSegments) {
   // Set up generic ellipse coordinates at the north pole:
   var c = Math.cos(i);
   var x1 = innerRadius + c * (c < 0 ? innerRadius : (outerRadius - innerRadius));
   var y1 = width * Math.sin(i);
   // Apply the transform:
   var x2 = t[0][0] * x1 + t[0][1] * y1 + t[0][2] * z1;
   var y2 = t[1][0] * x1 + t[1][1] * y1 + t[1][2] * z1;
   var z2 = t[2][0] * x1 + t[2][1] * y1 + t[2][2] * z1;
   // Convert from Cartesian to lat/lon:
   var length = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
   var lat = 360 * (TAU/4 - Math.acos(z2 / length)) / TAU;
   var lon = 360 * Math.atan2(y2, x2) / TAU;
   while(lat < -90)
    lat += 180;
   while(lat > 90)
    lat -= 180;
   path.push([lon,lat]);
  }
  return path;
 }

 function product(r1, r2) {
  var t = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for(var i=0; i<3; i++)
   for(var j=0; j<3; j++)
    for(var k=0; k<3; k++)
     t[i][j] += r1[i][k] * r2[k][j];
  return t;
 }

 function rotation(x, y, z, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  var a = 1 - c;
  return [[  c+a*x*x, a*x*y-s*z, a*x*z+s*y],
          [a*y*x+s*z,   c+a*y*y, a*y*z-s*x],
          [a*z*x-s*y, a*z*y+s*x,   c+a*z*z]];
 }
};
