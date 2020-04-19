export function clamp (val, min, max) {
  return Math.min(max, Math.max(min, val))
}

export function clampNorm (val) {
  return val < 0 ? 0 : (val > 1 ? 1 : val)
}

export function diagonal (w, h) {
  return Math.sqrt(w * w + h * h)
}

export function distance (x1, y1, x2, y2) {
  const dx = x1 - x2
  const dy = y1 - y2
  return Math.sqrt(dx * dx + dy * dy)
}

export function lerp (val, x, y) {
  return x + ((y - x) * val)
}

export function map (value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, clamped) {
  const newValue = (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
  if (clamped) return clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax))
  return newValue
}

export function range (value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, clamped) {
  const newValue = (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
  if (clamped) return clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax))
  return newValue
}

export function random (min = 0, max = 0, precision = 0) {
  if (typeof min === 'undefined') return Math.random()
  if (min === max) return min
  if (precision === 0) return Math.floor(Math.random() * ((max + 1) - min) + min)
  return Math.round((min + Math.random() * (max - min)), precision)
};

export function randomFloat (min, max, precision = 2) {
  return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision))
}

export function randomHexColor () {
  return '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6)
}

export function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function degrees (radians) {
  return radians * (180 / Math.PI)
};

export function radians (degrees) {
  return degrees * (Math.PI / 180)
};

export function mix (a, b, alpha) {
  return a * (1.0 - alpha) + b * alpha
};

export function fract (value) {
  return value - Math.floor(value)
};

export function mod (value, n) {
  return ((value % n) + n) % n
};

export function modAbs (val, length) {
  if (val < 0) {
    val = length + val % length
  }
  if (val >= length) {
    return val % length
  }
  return val
}

export function normalize (val, min, max) {
  return (val - min) / (max - min)
}

export function parabola (val, x) {
  return (4 * x * (1 - x)) ** val
}

export function smoothstep (val, min, max) {
  const x = Math.max(0, Math.min(1, (val - min) / (max - min)))
  return x * x * (3 - 2 * x)
}
