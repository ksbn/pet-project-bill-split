import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock EventSource globally for tests
global.EventSource = class MockEventSource {
  constructor(url) {
    this.url = url
    this.listeners = {}
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(fn)
  }
  removeEventListener(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== fn)
    }
  }
  close() {}
}

afterEach(() => {
  cleanup()
})