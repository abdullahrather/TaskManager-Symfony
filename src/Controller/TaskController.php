<?php

namespace App\Controller;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tasks', name: 'api_tasks_')]
class TaskController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $status = $request->query->get('status');
        $priority = $request->query->get('priority');
        $search = $request->query->get('search');
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);

        if ($search) {
            $tasks = $this->taskRepository->search($search);
            $total = count($tasks);
            $totalPages = 1;
        } elseif ($status) {
            $tasks = $this->taskRepository->findByStatus($status);
            $total = count($tasks);
            $totalPages = 1;
        } elseif ($priority) {
            $tasks = $this->taskRepository->findByPriority($priority);
            $total = count($tasks);
            $totalPages = 1;
        } else {
            $tasks = $this->taskRepository->findWithPagination($page, $limit);
            $total = $this->taskRepository->countAll();
            $totalPages = ceil($total / $limit);
        }

        return $this->json([
            'success' => true,
            'data' => array_map([$this, 'serializeTask'], $tasks),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => $totalPages
            ]
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'error' => 'Task not found'
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'success' => true,
            'data' => $this->serializeTask($task)
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON'
            ], Response::HTTP_BAD_REQUEST);
        }

        $task = new Task();
        $task->setTitle($data['title'] ?? '');
        $task->setDescription($data['description'] ?? null);

        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }

        if (isset($data['priority'])) {
            $task->setPriority($data['priority']);
        }

        if (isset($data['dueDate'])) {
            try {
                $dueDate = new \DateTimeImmutable($data['dueDate']);
                $task->setDueDate($dueDate);
            } catch (\Exception $e) {
                return $this->json([
                    'success' => false,
                    'error' => 'Invalid due date format. Use: YYYY-MM-DD'
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'errors' => $this->formatValidationErrors($errors)
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => $this->serializeTask($task)
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'error' => 'Task not found'
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }
        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }
        if (isset($data['priority'])) {
            $task->setPriority($data['priority']);
        }
        if (isset($data['dueDate'])) {
            try {
                $dueDate = $data['dueDate'] ? new \DateTimeImmutable($data['dueDate']) : null;
                $task->setDueDate($dueDate);
            } catch (\Exception $e) {
                return $this->json([
                    'success' => false,
                    'error' => 'Invalid due date format. Use: YYYY-MM-DD'
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'errors' => $this->formatValidationErrors($errors)
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $this->serializeTask($task)
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'error' => 'Task not found'
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $total = $this->taskRepository->countAll();
        $pending = $this->taskRepository->countByStatus('pending');
        $inProgress = $this->taskRepository->countByStatus('in_progress');
        $completed = $this->taskRepository->countByStatus('completed');
        $overdue = count($this->taskRepository->findOverdue());

        return $this->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'inProgress' => $inProgress,
                'completed' => $completed,
                'overdue' => $overdue,
                'completionRate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0
            ]
        ]);
    }

    #[Route('/overdue', name: 'overdue', methods: ['GET'])]
    public function overdue(): JsonResponse
    {
        $tasks = $this->taskRepository->findOverdue();

        return $this->json([
            'success' => true,
            'data' => array_map([$this, 'serializeTask'], $tasks)
        ]);
    }

    private function serializeTask(Task $task): array
    {
        return [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'status' => $task->getStatus(),
            'priority' => $task->getPriority(),
            'dueDate' => $task->getDueDate()?->format('Y-m-d'),
            'createdAt' => $task->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $task->getUpdatedAt()?->format('Y-m-d H:i:s')
        ];
    }

    private function formatValidationErrors($errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[$error->getPropertyPath()] = $error->getMessage();
        }
        return $formatted;
    }
}
