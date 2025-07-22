import { collapse } from 'string-collapse-white-space'

export function prompt(strings: TemplateStringsArray, ...values: unknown[]) {
  let promptString = ''
  for (let i = 0; i < strings.length; i++) {
    promptString += strings[i]
    if (i < values.length) {
      promptString += String(values[i])
    }
  }

  return collapse(promptString, { trimLines: true, trimnbsp: true }).result
}
