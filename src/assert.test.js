const AssertionError = require('./assertion-error')
const assertEquals = require('./assert')
const testData = require('./test-data')

describe('assertEquals', () => {
  const stringFromVariable = variable => {
    if (variable === null) return 'null'
    if (variable === undefined) return 'undefined'
    if (Array.isArray(variable)) return JSON.stringify(variable)
    if (typeof variable === 'string') return `"${variable.toString()}"`
    if (typeof variable === 'boolean' || typeof variable === 'number') return variable.toString()
    return JSON.stringify(variable)
  }
  const makeDescription = (expected, actual, passOrFail) =>
    `${stringFromVariable(expected)} and ${stringFromVariable(actual)} should ${passOrFail}`

  const shouldPass = (expected, actual) => {
    const testDescription = makeDescription(expected, actual, 'pass')
    test(testDescription, () => {
      expect(() => assertEquals(testDescription, expected, actual)).not.toThrow(AssertionError)
    })
  }

  const shouldFail = (expected, actual) => {
    const testDescription = makeDescription(expected, actual, 'fail')
    test(testDescription, () => {
      expect(() => assertEquals(testDescription, expected, actual)).toThrow(AssertionError)
    })
  }

  describe('strings', () => {
    shouldPass('abc', 'abc')
    shouldFail('abcdef', 'abc')
  })

  describe('numbers', () => {
    shouldPass(1, 1)
    shouldFail(1, 2)
  })

  describe('special objects', () => {
    shouldPass(null, null)
    shouldPass(undefined, undefined)
    shouldPass(NaN, NaN)
    shouldPass(Infinity, Infinity)

    shouldFail(null, undefined)
    shouldFail(null, NaN)
    shouldFail(null, Infinity)
    shouldFail(undefined, NaN)
    shouldFail(undefined, Infinity)
    shouldFail(NaN, Infinity)
  })

  describe('booleans', () => {
    shouldPass(true, true)
    shouldPass(false, false)
    shouldFail(true, false)
  })

  describe('truthy/falsy', () => {
    shouldFail(true, 1)
    shouldFail(false, 0)
    shouldFail(true, 'true')
    shouldFail(1, '1')
    shouldFail(true, [])
    shouldFail(true, {})
    shouldFail(true, () => {})
  })

  describe('arrays', () => {
    shouldPass([], [])
    shouldFail([1], [])
    shouldFail([1], [2])
    shouldPass([1], [1])
    shouldPass([1, 2, 'three'], [1, 2, 'three'])
    shouldFail([1, 2, 3], [1, 3, '3'])
    shouldPass([1, [true, 'thing', ['foo', 42]]], [1, [true, 'thing', ['foo', 42]]])
    shouldFail([1, [true, 'thing', ['foo', 42]]], [1, [true, 'thing', ['foot', 42]]])
  })

  describe('objects', () => {
    shouldPass({}, {})
    shouldPass({ foo: 'bar' }, { foo: 'bar' })
    shouldFail({ foo: 'bar' }, {})
    shouldFail({ foo: 'bar' }, { foo: 'bart' })

    shouldPass({ foo: { foot: 'feet' } }, { foo: { foot: 'feet' } })
    shouldFail({ foo: { foot: 'feet' } }, { foo: { foot: 'baaaaa' } })

    shouldFail({ foo: [1, 'bat'] }, { foo: [1, 'bar'] })
    shouldFail([{ foo: 'bar' }, {}], [{}, { foo: 'bar' }])
  })

  describe('assertion message', () => {
    test('a failed assertion should throw the assertion message given to it', () => {
      const message = 'some test message'
      expect(() => assertEquals(message, 'abcdef', 'abc')).toThrowError(message)
    })

    test('string compare failure should show \'Expected "a" found "b"\' concatenated onto message', () => {
      const message = 'some test message'
      expect(() => assertEquals(message, 'abcdef', 'abc')).toThrowError(
        `${message}Expected "abcdef" found "abc"`,
      )
    })

    it("type compare failure should show 'Expected type Array but found Object' concatenated onto message", () => {
      const message = 'boo'
      expect(() => assertEquals(message, [], {})).toThrowError(
        `${message}Expected type Array but found Object`,
      )
    })

    it("array length failure should show 'Expected array length n but found m' concatenated onto message", () => {
      const message = 'yah'
      expect(() => assertEquals(message, [1, 2], [1, 2, 3])).toThrowError(
        new RegExp(`^${message}Expected array length 2 but found 3$`),
      )
    })

    it("missing prop should show 'Expected propB.propC but was not found'", () => {
      const message = 'yah'
      expect(() =>
        assertEquals(message, testData.complexObject1, testData.complexObject3),
      ).toThrowError(new RegExp(`^${message}Expected propB.propC but was not found$`))
    })
  })
})