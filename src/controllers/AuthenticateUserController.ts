import { Request , Response} from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

class AuthenticateUserController {
	async handle(request: Request, response: Response) {

      const { code } = request.body;

		const service = new AuthenticateUserService();

		// Tratativa do erro 401
      // 
      // adiciona uma mensagem de erro, caso não seja possível usar o código gerado
      // pelo github pois este expirou, por exemplo.
      // 

      try {
         const result = await service.execute(code);	
         return response.json(result);

      }catch (err) {
         return response.json({error: err.message});
      }
	};
};

export { AuthenticateUserController };