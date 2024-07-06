function Avatar({username, userId}) {
    const colors = ['bg-red-200','bg-blue-200','bg-purple-200','bg-yellow-200','bg-teal-200','bg-green-200']
    const userIdBase10 = parseInt(userId, 16)
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex]
  return (
    <div className={"w-8 h-8 bg-red-300 rounded-full flex items-center " + color}>
        <div className="w-full text-center">
            {username[0]}
        </div>
    </div>
  )
}

export default Avatar