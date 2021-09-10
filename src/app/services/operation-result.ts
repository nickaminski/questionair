export interface OperationResult<T>
{
    data: T;
    message: string;
    isSuccess: boolean;
}