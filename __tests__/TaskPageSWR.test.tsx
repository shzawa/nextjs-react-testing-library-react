/**
 * @jest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { TASK } from '../types/Types'
import 'setimmediate'
import { SWRConfig } from 'swr'
import TaskPage from '../pages/task-page'

const server = setupServer(
  rest.get('https://jsonplaceholder.typicode.com/todos/', (req, res, ctx) => {
    const query = req.url.searchParams
    const _limit = query.get('_limit')

    if (_limit === '10') {
      const tasks: TASK[] = [
        {
          userId: 1,
          id: 1,
          title: 'Static task A',
          completed: true,
        },
        {
          userId: 2,
          id: 2,
          title: 'Static task B',
          completed: false,
        },
      ]

      return res(ctx.status(200), ctx.json(tasks))
    }
  })
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

describe('Todos page / useSWR', () => {
  let staticProps: TASK[] = [
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

  it('Should render CSF data after pre-rendered data', async () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <TaskPage staticTasks={staticProps} />
      </SWRConfig>
    )

    expect(await screen.findByText('Static task C')).toBeInTheDocument()
    expect(screen.getByText('Static task D')).toBeInTheDocument()

    expect(await screen.findByText('Static task A')).toBeInTheDocument()
    expect(screen.getByText('Static task B')).toBeInTheDocument()
  })

  it('Should render Error text when fetch failed', async () => {
    server.use(
      rest.get(
        'https://jsonplaceholder.typicode.com/todos/',
        (req, res, ctx) => {
          const query = req.url.searchParams
          const _limit = query.get('_limit')

          if (_limit === '10') {
            return res(ctx.status(400))
          }
        }
      )
    )
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <TaskPage staticTasks={staticProps} />
      </SWRConfig>
    )

    expect(await screen.findByText('Error!')).toBeInTheDocument()
  })
})
