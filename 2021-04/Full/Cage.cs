namespace Bingo;

public class Cage
{
    private readonly Queue<Ball> _balls;

    public Cage(string numbers)
    {
        var balls = numbers.Split(',')
            .Select(n => new Ball(byte.Parse(n.Trim())));
        _balls = new Queue<Ball>(balls);
    }

    public Ball Next()
        => _balls.Dequeue();
}