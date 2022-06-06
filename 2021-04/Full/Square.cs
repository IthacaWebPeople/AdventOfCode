namespace Bingo;

public record Square(byte Value)
{
    public bool Marked { get; private set; }

    public void Mark()
        => Marked = true;
}