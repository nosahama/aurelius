import nc from 'next-connect';
import prisma from '../../../lib/prisma';

async function getOne(req, res) {
	const { postId } = req.params;

	const post = await prisma.post.findUnique({
		where: {
			id: postId,
		},
	});
	res.status(200).json(post);
}

async function update(req, res) {
	const { id } = req.query;
	const data = req.body.data;
	const updatedPost = await prisma.post.update({
		data,
		where: {
			id,
		},
	});
	res.status(200).json({ message: 'post_updated', post: updatedPost });
}

async function deleteOne(req, res) {
	const { id } = req.query;
	const deletedPost = await prisma.post.delete({
		where: {
			id,
		},
		select: {
			title: true,
		},
	});
	res.status(200).json({ message: 'post_deleted', post: deletedPost });
}

export default nc({ attachParams: true })
	.get(getOne)
	.post(update)
	.delete(deleteOne);