/**
 * @jest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { initTestHelpers, getPage } from 'next-page-tester'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { TASK } from '../types/Types'
import 'setimmediate'

initTestHelpers() // next-page-testerを使うのに必要

const server = setupServer(
  rest.get(
    'https://jsonplaceholder.typicode.com/todos/?_limit=10',
    (req, res, ctx) => {
      const tasks: TASK[] = [
        {
          userId: 3,
          id: 3,
          title: 'Static task C',
          completed: true,
        },
        {
          userId: 4,
          id: 4,
          title: 'Static task D',
          completed: false,
        },
      ]

      return res(ctx.status(200), ctx.json(tasks))
    }
  )
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => {
  server.close()
})

describe('Todo page / getStaticProps', () => {
  it('Should render the list of tasks pre-fetched by getStaticProps', async () => {
    const { page } = await getPage({ route: '/task-page' })
    render(page)

    expect(await screen.findByText('todos page')).toBeInTheDocument()
    expect(screen.getByText('Static task C')).toBeInTheDocument()
    expect(screen.getByText('Static task D')).toBeInTheDocument()
  })
})
