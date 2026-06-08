import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // 1. Signaux d'état globaux
  messages = signal<ChatMessage[]>([
    { 
      text: 'Bonjour ! Je suis TraceAI Copilot. Une panne, un comportement anormal ou une trace Elasticsearch à analyser ? Je vous écoute.', 
      sender: 'ai', 
      timestamp: this.getFormattedTime() 
    }
  ]);
  
  newMessageText = signal<string>(''); 
  isLoading = signal<boolean>(false);
  isChatOpen = signal<boolean>(false);

  // 2. Configuration locale Ollama
  private readonly AI_ENDPOINT = 'http://localhost:11434/api/generate'; 
  private readonly MODEL_NAME = 'llama3.2:1b';

  constructor(private http: HttpClient) {}

  toggleChat(): void {
    this.isChatOpen.update(open => !open);
  }

  sendMessage(): void {
    const prompt = this.newMessageText().trim();
    
    // Protection contre les doubles envois ou les prompts vides
    if (!prompt || this.isLoading()) return;

    // Bloquer immédiatement l'interface utilisateur pour éviter le spam
    this.isLoading.set(true);
    const userTime = this.getFormattedTime();
    
    // Étape A : Injection du message utilisateur dans la discussion
    this.messages.update(msgs => [...msgs, { text: prompt, sender: 'user', timestamp: userTime }]);
    
    // ✅ CORRECTION : On ne vide le champ de saisie QU'APRÈS avoir validé l'affichage du message à l'écran
    this.newMessageText.set('');

    // Étape B : Payload adapté et sécurisé pour éviter les hallucinations (ex: Google Notes)
    const payload = {
      model: this.MODEL_NAME,
      prompt: `Tu es TraceAI, un ingénieur de diagnostic technique spécialisé dans les infrastructures informatiques, Docker, Kubernetes et Elasticsearch.
               Analyse de manière concise, strictement professionnelle et sous forme de liste à puces le problème suivant.
               Si la demande ne contient qu'un mot-clé ou est incomplète, demande des précisions (logs, configuration).
               Problème : ${prompt}`,
      stream: false
    };

    // Étape C : Requête vers l'instance Ollama locale
    this.http.post<{ response: string }>(this.AI_ENDPOINT, payload)
      .pipe(
        catchError((error) => {
          console.error('Erreur de communication TraceAI Copilot :', error);
          return of({ 
            response: "⚠️ Impossible de joindre le moteur d'intelligence artificielle. Vérifiez qu'Ollama est démarré localement avec l'autorisation CORS active (OLLAMA_ORIGINS=\"*\")." 
          });
        }),
        finalize(() => {
          // Libère le loader et réactive l'input
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          const aiTime = this.getFormattedTime();
          
          // Fallback de sécurité si l'API renvoie un objet mal construit
          const replyText = res && res.response ? res.response : "Le modèle a renvoyé une réponse vide ou invalide.";

          // Étape D : Mise à jour du flux avec la réponse de Llama
          this.messages.update(msgs => [...msgs, { 
            text: replyText, 
            sender: 'ai', 
            timestamp: aiTime 
          }]);
        }
      });
  }

  private getFormattedTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}