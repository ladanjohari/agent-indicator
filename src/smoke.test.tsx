import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test harness', () => {
  it('renders React into a fake browser', () => {
    render(<p>hello</p>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
