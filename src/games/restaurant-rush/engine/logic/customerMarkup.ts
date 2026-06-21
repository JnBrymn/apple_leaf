// @ts-nocheck

export function randomCustomerLook() {
  const gender = Math.random() < 0.5 ? 'boy' : 'girl'
  const skins = ['pale', 'peach', 'dark']
  const skin = skins[Math.floor(Math.random() * skins.length)]
  const hasLipstick = gender === 'girl' && Math.random() < 0.4
  const hasMustache = gender === 'boy' && Math.random() < 0.4
  return { gender, skin, hasLipstick, hasMustache }
}

export function customerClassNames(look) {
  const classes = ['customer', 'customer-' + look.gender, 'skin-' + look.skin]
  if (look.hasLipstick) classes.push('has-lipstick')
  if (look.hasMustache) classes.push('has-mustache')
  return classes.join(' ')
}

export function customerFigureMarkup(look) {
  if (!look) return ''
  return (
    '<div class="' +
    customerClassNames(look) +
    '" aria-hidden="true">' +
    '<div class="customer-head">' +
    '<div class="customer-face">' +
    '<div class="customer-eyes" aria-hidden="true">' +
    '<span class="customer-eye-group"><span class="customer-lashes" aria-hidden="true"></span><span class="customer-eye eye-l"></span></span>' +
    '<span class="customer-eye-group"><span class="customer-lashes" aria-hidden="true"></span><span class="customer-eye eye-r"></span></span>' +
    '</div></div>' +
    '<div class="customer-lipstick" aria-hidden="true"></div>' +
    '<div class="customer-mustache" aria-hidden="true"></div>' +
    '</div>' +
    '<div class="customer-body"></div>' +
    '</div>'
  )
}

export function randomCafeteriaSeat() {
  if (Math.random() >= 0.82) return null
  return randomCustomerLook()
}
