var module = { _orig: window.module };
define = function(id, deps, value) {
module[id] = value();
};
 define.amd = { jQuery: true };

window.can = module['can/util/can.js'];
window.module = module._orig;