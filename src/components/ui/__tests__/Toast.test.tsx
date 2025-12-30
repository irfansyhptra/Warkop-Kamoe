import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Toast } from '../Toast'

describe('Toast', () => {
  it('renders title and message', () => {
    const notification = {
      id: '1',
      type: 'success',
      title: 'Sukses',
      message: 'Operasi berhasil',
      duration: 5000,
    }

    const onClose = vi.fn()
    render(<Toast notification={notification} onClose={onClose} />)

    expect(screen.getByText('Sukses')).toBeInTheDocument()
    expect(screen.getByText('Operasi berhasil')).toBeInTheDocument()
  })
})
