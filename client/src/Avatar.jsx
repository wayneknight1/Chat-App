function Avatar({username, userId, online}) {
    const colors = ['bg-red-200','bg-blue-200','bg-purple-200','bg-yellow-200','bg-teal-200','bg-green-200']
    const userIdBase10 = parseInt(userId, 16)
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex]
  return (
    <div className={"w-8 h-8 bg-red-300 rounded-full flex items-center relative " + color}>
        <div className="w-full text-center">
            {username[0]}
        </div>
       {online && <div className="absolute w-2 h-2 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>}
       {!online && <div className="absolute w-2 h-2 bg-red-400 bottom-0 right-0 rounded-full border border-white"></div>}
    </div>
  )
}

export default Avatar