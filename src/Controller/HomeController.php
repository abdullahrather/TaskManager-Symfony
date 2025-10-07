<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        $htmlPath = $this->getParameter('kernel.project_dir') . '/public/index.html';
        
        if (!file_exists($htmlPath)) {
            return new Response('Welcome to Task API. Frontend not found.', Response::HTTP_NOT_FOUND);
        }
        
        $html = file_get_contents($htmlPath);
        return new Response($html);
    }
}
