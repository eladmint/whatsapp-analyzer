import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from '../declarations/chat_analyzer/chat_analyzer.did';

// Local development
const LOCAL_II_CANISTER = 'http://localhost:4943?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai';

class ICPService {
  private agent: HttpAgent | null = null;
  private actor: any = null;
  private authClient: AuthClient | null = null;

  async init() {
    try {
      this.authClient = await AuthClient.create();
      
      const isLocal = process.env.NODE_ENV !== 'production';
      const host = isLocal ? 'http://127.0.0.1:4943' : 'https://ic0.app';

      this.agent = new HttpAgent({
        host,
        identity: this.authClient.getIdentity()
      });

      if (isLocal) {
        await this.agent.fetchRootKey();
      }

      // Get the canister ID from environment or use a default for local development
      const canisterId = process.env.CHAT_ANALYZER_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai';

      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
      return false;
    }
  }

  async login() {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    await this.authClient.login({
      identityProvider: process.env.NODE_ENV === 'production' 
        ? 'https://identity.ic0.app'
        : LOCAL_II_CANISTER,
      onSuccess: () => {
        this.init();
      }
    });
  }

  async logout() {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    await this.authClient.logout();
    this.actor = null;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.authClient?.isAuthenticated() || false;
  }

  async saveChat(data: string): Promise<boolean> {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    return this.actor.saveChat(data);
  }

  async getChat(): Promise<string | null> {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    return this.actor.getChat();
  }

  async saveAnalysis(analysis: string): Promise<boolean> {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    return this.actor.saveAnalysis(analysis);
  }

  async getAnalysis(): Promise<string | null> {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    return this.actor.getAnalysis();
  }

  async clearData(): Promise<boolean> {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    return this.actor.clearData();
  }
}

export const icpService = new ICPService();